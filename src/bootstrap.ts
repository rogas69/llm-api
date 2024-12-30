import { asClass, asFunction, asValue, createContainer } from "awilix";
import { scopePerRequest } from "awilix-express";
import { Application } from "express";
import { Logger } from "./services/Logger";
import { ILogger } from "./services/ILogger";
import { MongoClient } from "mongodb";
import { DBContext } from "./database/dbcontext";

import { BoundariesRepository } from "./services/data/boundariesrepository";
/**
 * This function is responsible for loading the DI container
 * @param app - the express application
 */ 
export const setupDIContainer = (app: Application) => {
  
  
  const container = createContainer( {injectionMode: "CLASSIC"} );
  
  container.register({ logger: asFunction<ILogger>(() => new Logger()).singleton() });

  console.log(process.env.DB_CONNECTION_STRING);

  container.register({ mongoDbClient: asFunction<MongoClient>(()=> new MongoClient(process.env.DB_CONNECTION_STRING!)).scoped() })
  container.register({ dbName: asValue<string>(process.env.DB_NAME!) });
  container.register({ dbContext: asClass(DBContext).scoped() });

  container.register({ boundariesRepo: asClass(BoundariesRepository).scoped() });

  app.use(scopePerRequest(container));
}