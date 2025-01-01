import { asClass, asFunction, asValue, AwilixContainer, createContainer } from "awilix";
import { scopePerRequest } from "awilix-express";
import { Application } from "express";
import { Logger } from "./services/Logger";
import { ILogger } from "./services/ILogger";
import { MongoClient } from "mongodb";
import { DBContext } from "./database/dbcontext";

import { BoundariesRepository } from "./services/data/boundariesrepository";
import { BoundaryConfigurationRepository } from "./services/data/boundaryconfigurationrepository";
import { DataSeedService } from "./services/dataseed.service";
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

  container.register({ boundariesRepo: asClass(BoundariesRepository).scoped() });
  container.register({ boundaryConfigurationRepo: asClass(BoundaryConfigurationRepository).scoped() });
  
  container.register({ dataSeedService: asClass(DataSeedService).scoped() });

  app.use(scopePerRequest(container));

  return container;
}