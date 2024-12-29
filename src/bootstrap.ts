import { asClass, asFunction, asValue, createContainer } from "awilix";
import { scopePerRequest } from "awilix-express";
import { Application } from "express";
import { Logger } from "./services/Logger";
import { ILogger } from "./services/ILogger";
import { MongoClient } from "mongodb";
import { DBContext } from "./database/dbcontext";
import * as dotenv from 'dotenv'
import { RolesRepository } from "./services/data/rolesrepository";
/**
 * This function is responsible for loading the DI container
 * @param app - the express application
 */ 
export const setupDIContainer = (app: Application) => {
  
  dotenv.config();
  const container = createContainer( {injectionMode: "CLASSIC"} );
  
  container.register({ logger: asFunction<ILogger>(() => new Logger()).scoped() });

  container.register({ mongoDbClient: asFunction<MongoClient>(()=> new MongoClient(process.env.DB_CONNECTION_STRING!)).scoped() })
  container.register({ dbName: asValue<string>(process.env.DB_NAME!) });
  container.register({ dbContext: asClass(DBContext).scoped() });

  container.register({ rolesRepo: asClass(RolesRepository).scoped() });

  app.use(scopePerRequest(container));
}