import { asClass, asFunction, asValue, AwilixContainer, createContainer } from "awilix";
import { scopePerRequest } from "awilix-express";
import { Application } from "express";
import { Logger } from "./services/Logger";
import { ILogger } from "./services/ILogger";
import { MongoClient } from "mongodb";
import { DBContext } from "./database/dbcontext";

import { BoundaryRepository } from "./services/data/boundary.repository";
import { BoundaryConfigurationRepository } from "./services/data/boundaryconfiguration.repository";
import { DataSeedService } from "./services/dataseed.service";
import { ProviderConfigurationRepository } from "./services/data/providerconfiguration.repository";
import { EntitlementRepository } from "./services/data/entitlements.repository";
/**
 * This function is responsible for loading the DI container
 * @param app - the express application
 */ 
export const setupDIContainer = (app: Application) => {
  
  
  const container : AwilixContainer<any>  = createContainer( {injectionMode: "CLASSIC"} );
  
  container.register({ logger: asFunction<ILogger>(() => new Logger()).singleton() });

  container.register({ mongoDbClient: asFunction<MongoClient>(()=> new MongoClient(process.env.DB_CONNECTION_STRING!)).scoped() })
  container.register({ dbName: asValue<string>(process.env.DB_NAME!) });
  container.register({ dbContext: asClass(DBContext).scoped() });

  container.register({ boundaryRepo: asClass(BoundaryRepository).scoped() });
  container.register({ boundaryConfigurationRepo: asClass(BoundaryConfigurationRepository).scoped() });
  container.register({ providerConfigurationRepo: asClass(ProviderConfigurationRepository).scoped() });

  container.register({ entitlementRepo: asClass(EntitlementRepository).scoped() });

  container.register({ dataSeedService: asClass(DataSeedService).scoped() });

  app.use(scopePerRequest(container));

  return container;
}