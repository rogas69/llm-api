import express from 'express';
import request from 'supertest';
import { createContainer, asClass, asValue, asFunction } from 'awilix';
import { scopePerRequest, controller } from 'awilix-express';
import { BoundaryConfigurationController } from '../../../src/controllers/admin/boundaryconfiguration.controller';
import { BoundaryConfigurationRepository } from '../../../src/services/data/boundaryconfiguration.repository';
import { ILogger } from '../../../src/services/ILogger';
import { BoundaryConfigurationDto } from '../../../src/services/data/boundaryconfigurationdto';
import { HttpStatus } from 'http-status-ts';
import { DBContext } from '../../../src/database/dbcontext';
import { Db } from 'mongodb';

describe('BoundaryConfigurationController', () => {
    let app: express.Application;
    let logger: ILogger;
    let dbContext: DBContext;
    let boundaryConfigurationRepo: BoundaryConfigurationRepository;
    let db: Db;


    beforeEach(() => {
        const container = createContainer({injectionMode: "CLASSIC"});
        logger = { 
            log: jest.fn(), 
            warn: jest.fn(), 
            error: jest.fn() 
        } as unknown as ILogger;

        db = {
            collection: jest.fn(),
        } as unknown as Db;

        dbContext = {
            connectDatabase: jest.fn().mockReturnValue(db),
            [Symbol.dispose]: jest.fn(),
        } as unknown as DBContext;

        boundaryConfigurationRepo = {
            collectionName: 'boundaryConfigurations',
            logger: logger,
            dbContext: dbContext,
            buildFilter: jest.fn(),
            getBoundaryConfigurations: jest.fn(),
            insertBoundaryConfiguration: jest.fn(),
            updateBoundaryConfiguration: jest.fn(),
            deleteBoundaryConfigurationByBoundaryName: jest.fn(),
            validString: jest.fn(),
            validateBoundaryConfiguration: jest.fn(),
            getFilteredBoundaryConfigurations: jest.fn()
        } as unknown as BoundaryConfigurationRepository;

        app = express();
        app.use(express.json());


        container.register({
            logger: asFunction(() => logger).scoped(),
            boundaryConfigurationRepo: asValue<BoundaryConfigurationRepository>(boundaryConfigurationRepo),
            boundaryConfigurationController: asClass(BoundaryConfigurationController).singleton()
        });
        app.use(scopePerRequest(container));
        
        const router = controller(BoundaryConfigurationController);
        app.use(router);
    });

    test('GET /admin/boundaryconfigurations should return all boundary configurations', async () => {
        const configurations: BoundaryConfigurationDto[] = [{
            boundaryName: 'test',
            modelProvider: 'Ollama',
            llmModelName: '',
            embeddingsModelName: '',
            comments: null
        }];
        boundaryConfigurationRepo.getBoundaryConfigurations = jest.fn().mockResolvedValue(configurations);

        const response = await request(app).get('/admin/boundaryconfigurations');

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.configurations).toEqual(configurations);
        expect(logger.log).toHaveBeenCalledWith('getBoundaryConfigurations called;');
    });

    test('POST /admin/boundaryconfigurations should add a new boundary configuration', async () => {
        const newConfiguration: BoundaryConfigurationDto = {
            boundaryName: 'test',
            modelProvider: 'Ollama',
            llmModelName: '',
            embeddingsModelName: '',
            comments: null
        };
        (boundaryConfigurationRepo.insertBoundaryConfiguration as jest.Mock).mockResolvedValue(true);

        const response = await request(app).post('/admin/boundaryconfigurations').send(newConfiguration);

        expect(response.status).toBe(HttpStatus.CREATED);
        expect(logger.log).toHaveBeenCalledWith('addBoundaryConfiguration called');
    });

    test('POST /admin/boundaryconfigurations should return BAD_REQUEST if insertion fails', async () => {
        const newConfiguration: BoundaryConfigurationDto = {
            boundaryName: 'test',
            modelProvider: 'Ollama',
            llmModelName: '',
            embeddingsModelName: '',
            comments: null
        };

        (boundaryConfigurationRepo.insertBoundaryConfiguration as jest.Mock).mockResolvedValue(false);

        const response = await request(app).post('/admin/boundaryconfigurations').send(newConfiguration);

        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(logger.log).toHaveBeenCalledWith('addBoundaryConfiguration called');
    });

    test('PUT /admin/boundaryconfigurations should update a boundary configuration', async () => {
        const updatedConfiguration: BoundaryConfigurationDto = {
            boundaryName: 'test',
            modelProvider: 'Ollama',
            llmModelName: '',
            embeddingsModelName: '',
            comments: null
        };
        (boundaryConfigurationRepo.updateBoundaryConfiguration as jest.Mock).mockResolvedValue(true);

        const response = await request(app).put('/admin/boundaryconfigurations').send(updatedConfiguration);

        expect(response.status).toBe(HttpStatus.OK);
        expect(logger.log).toHaveBeenCalledWith('updateBoundaryConfiguration called');
    });

    test('PUT /admin/boundaryconfigurations should return BAD_REQUEST if update fails', async () => {
        const updatedConfiguration: BoundaryConfigurationDto = {
            boundaryName: 'test',
            modelProvider: 'Ollama',
            llmModelName: '',
            embeddingsModelName: '',
            comments: null
        };
        (boundaryConfigurationRepo.updateBoundaryConfiguration as jest.Mock).mockResolvedValue(false);

        const response = await request(app).put('/admin/boundaryconfigurations').send(updatedConfiguration);

        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(logger.log).toHaveBeenCalledWith('updateBoundaryConfiguration called');
    });

    test('DELETE /admin/boundaryconfigurations/:name should delete a boundary configuration', async () => {
        (boundaryConfigurationRepo.deleteBoundaryConfigurationByBoundaryName as jest.Mock).mockResolvedValue(true);

        const response = await request(app).delete('/admin/boundaryconfigurations/test');

        expect(response.status).toBe(HttpStatus.OK);
        expect(logger.log).toHaveBeenCalledWith('deleteBoundaryConfiguration called');
    });

    test('DELETE /admin/boundaryconfigurations/:name should return BAD_REQUEST if deletion fails', async () => {
        (boundaryConfigurationRepo.deleteBoundaryConfigurationByBoundaryName as jest.Mock).mockResolvedValue(false);

        const response = await request(app).delete('/admin/boundaryconfigurations/test');

        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(logger.log).toHaveBeenCalledWith('deleteBoundaryConfiguration called');
    });
});