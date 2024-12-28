import { asClass, asFunction, createContainer } from "awilix";
import { scopePerRequest } from "awilix-express";
import { Application } from "express";
import { Logger } from "./services/Logger";
import { ILogger } from "./services/ILogger";

/**
 * This function is responsible for loading the DI container
 * @param app - the express application
 */ 
export const setupDIContainer = (app: Application) => {
  const container = createContainer( {injectionMode: "CLASSIC"} );
  
  container.register({ logger: asFunction<ILogger>(() => new Logger()).scoped() });

  app.use(scopePerRequest(container));
}