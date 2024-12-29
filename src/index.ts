import express from 'express';
import { loadControllers } from 'awilix-express';
import { setupDIContainer } from './bootstrap';
import { ILogger } from './services/ILogger';
import { Logger } from './services/Logger';

const HTTP_PORT = 3000;

const logger: ILogger = new Logger();

const startServer = async () => {

    const app: express.Application = express();
    app.use(express.json());
    
    setupDIContainer(app);
    
    const router : express.Router = loadControllers('controllers/*.ts', { cwd: __dirname }); 
    app.use(router);

    app.listen(HTTP_PORT, () => {
        logger.log(`Server is running at http://localhost:${HTTP_PORT}`);
    });
}

//this is actually running the application (anonymous function)
(() => {
    try {
        logger.warn('Starting server...');
        startServer();
        logger.log('Server started successfully');
    } catch (error) {
        logger.error(String(error));
    }
})();