import express from 'express';
import request from 'supertest';
import { asClass, asFunction, asValue, createContainer } from 'awilix';
import { scopePerRequest, controller } from 'awilix-express';
import { ProviderConfigurationController } from '../../../src/controllers/admin/providerconfiguration.controller';
import { ProviderConfigurationRepository } from '../../../src/services/data/providerconfigurationrepository';
import { ILogger } from '../../../src/services/ILogger';
import { HttpStatus } from 'http-status-ts';

describe('ProviderConfigurationController', () => {
    let app: express.Application;
    let logger: ILogger;
    let providerConfigurationRepo: ProviderConfigurationRepository;
    //let controller: ProviderConfigurationController;

    beforeEach(() => {
        const container = createContainer({ injectionMode: "CLASSIC" });

        app = express();
        app.use(express.json());

        logger = {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        } as unknown as ILogger;

        providerConfigurationRepo = {
            getProviderConfigurations: jest.fn(),
            getProviderEmbeddingModels: jest.fn(),
            getProviderChatModels: jest.fn(),
        } as unknown as ProviderConfigurationRepository;

        container.register({
            logger: asFunction(() => logger).scoped(),
            providerConfigurationRepo: asValue<ProviderConfigurationRepository>(providerConfigurationRepo),
            providerConfigurationController: asClass(ProviderConfigurationController).singleton()
        });

        app.use(scopePerRequest(container));

        const router = controller(ProviderConfigurationController);
        app.use(router);
    });

    it('should get provider configurations', async () => {
        const configurations = [{
            modelProvider: 'OpenAI',
            llmModelNames: ['gpt-3'],
            embeddingsModelNames: ['embedding1'],
            llmModelParams: {},
            embeddingModelParams: {}
        }];
        providerConfigurationRepo.getProviderConfigurations = jest.fn().mockResolvedValue(configurations);

        const response = await request(app).get('/admin/providerconfigurations');

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.configurations).toEqual(configurations);
        expect(logger.log).toHaveBeenCalledWith('getProviderConfigurations called;');
    });

    it('should throw an exception when repository throws one', async () => {
        const configurations = [{
            modelProvider: 'OpenAI',
            llmModelNames: ['gpt-3'],
            embeddingsModelNames: ['embedding1'],
            llmModelParams: {},
            embeddingModelParams: {}
        }];
        providerConfigurationRepo.getProviderConfigurations = jest.fn().mockRejectedValue(new Error("This is a test exception"));

        const response = await request(app).get('/admin/providerconfigurations');

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(logger.log).toHaveBeenCalledWith('getProviderConfigurations called;');
    });

    it('should get embedding models for provider', async () => {
        const models = ['embedding1', 'embedding2'];
        (providerConfigurationRepo.getProviderEmbeddingModels as jest.Mock).mockResolvedValue(models);

        const response = await request(app).get('/admin/providerconfigurations/OpenAI/embeddingmodels');

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.embeddingmodels).toEqual(models);
        expect(logger.log).toHaveBeenCalledWith('getEmbeddingModelsForProvider called;');
    });

    it('should get chat models for provider', async () => {
        const models = ['gpt-3', 'gpt-3.5'];
        (providerConfigurationRepo.getProviderChatModels as jest.Mock).mockResolvedValue(models);

        const response = await request(app).get('/admin/providerconfigurations/OpenAI/chatmodels');

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.chatmodels).toEqual(models);
        expect(logger.log).toHaveBeenCalledWith('getEmbeddingModelsForProvider called;');
    });

    it('should get embedding model parameters for provider', async () => {
        const configurations = [{ modelProvider: 'OpenAI', llmModelNames: ['gpt-3'], embeddingsModelNames: ['embedding1'], llmModelParams: {}, embeddingModelParams: { baseUrl: 'http://localhost' } }];
        (providerConfigurationRepo.getProviderConfigurations as jest.Mock).mockResolvedValue(configurations);

        const response = await request(app).get('/admin/providerconfigurations/OpenAI/embeddingmodelparameters');

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.embeddingmodelparameters).toEqual(configurations[0].embeddingModelParams);
        expect(logger.log).toHaveBeenCalledWith('getEmbeddingModelsForProvider called;');
    });

    it('should return 404 if no embedding model parameters found for provider', async () => {
        (providerConfigurationRepo.getProviderConfigurations as jest.Mock).mockResolvedValue([]);

        const response = await request(app).get('/admin/providerconfigurations/OpenAI/embeddingmodelparameters');

        expect(response.status).toBe(HttpStatus.NOT_FOUND);
        expect(logger.log).toHaveBeenCalledWith('getEmbeddingModelsForProvider called;');
    });

    it('should get llm model parameters for provider', async () => {
        const configurations = [{ modelProvider: 'OpenAI', llmModelNames: ['gpt-3'], embeddingsModelNames: ['embedding1'], llmModelParams: { apiKey: 'key' }, embeddingModelParams: {} }];
        (providerConfigurationRepo.getProviderConfigurations as jest.Mock).mockResolvedValue(configurations);

        const response = await request(app).get('/admin/providerconfigurations/OpenAI/llmmodelparameters');

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.embeddingmodelparameters).toEqual(configurations[0].llmModelParams);
        expect(logger.log).toHaveBeenCalledWith('getEmbeddingModelsForProvider called;');
    });

    it('should return 404 if no llm model parameters found for provider', async () => {
        (providerConfigurationRepo.getProviderConfigurations as jest.Mock).mockResolvedValue([]);

        const response = await request(app).get('/admin/providerconfigurations/OpenAI/llmmodelparameters');

        expect(response.status).toBe(HttpStatus.NOT_FOUND);
        expect(logger.log).toHaveBeenCalledWith('getEmbeddingModelsForProvider called;');
    });
});