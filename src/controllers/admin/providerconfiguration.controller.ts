import * as express from 'express';
import { DELETE, GET, POST, PUT, route } from "awilix-express";
import { ILogger } from '../../services/ILogger';
import { HttpStatus } from 'http-status-ts';
import { ProviderConfigurationRepository } from '../../services/data/providerconfigurationrepository';

/**
 * Controller used to configure default configuration parameters for embedding and chat models for different providers.
 */
@route('/admin/providerconfigurations')
export class ProviderConfigurationController {
    constructor(
        private readonly logger: ILogger,
        private readonly providerConfigurationRepo: ProviderConfigurationRepository) { }


    @GET()
    async getProviderConfigurations(req: express.Request, res: express.Response) {
        try {
            this.logger.log('getProviderConfigurations called;');
            const providerName = req.query.providerName as string  | undefined;
            const configurations = await this.providerConfigurationRepo.getProviderConfigurations({ modelProvider: providerName });
            res.status(HttpStatus.OK)
                .json({ configurations: configurations });
        } catch (error) {
            const err : Error = error as Error;
            this.logger.error(`Error getting provider configurations: ${err.message}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .send();
        }
    }

    @route('/:name/embeddingmodels')
    @GET()
    async getEmbeddingModelsForProvider(req: express.Request, res: express.Response) {
        this.logger.log('getEmbeddingModelsForProvider called;');
        const providerName = req.params.name;
        const models = await this.providerConfigurationRepo.getProviderEmbeddingModels({ modelProvider: providerName });
        res.status(HttpStatus.OK)
            .json({ embeddingmodels: models });
    }

    @route('/:name/chatmodels')
    @GET()
    async getChatModelsForProvider(req: express.Request, res: express.Response) {
        this.logger.log('getEmbeddingModelsForProvider called;');
        const providerName = req.params.name;
        const models = await this.providerConfigurationRepo.getProviderChatModels({ modelProvider: providerName });
        res.status(HttpStatus.OK)
            .json({ chatmodels: models });
    }

    @route('/:name/embeddingmodelparameters')
    @GET()
    async getEmbeddingModelParametersForProvider(req: express.Request, res: express.Response) {
        this.logger.log('getEmbeddingModelsForProvider called;');
        const providerName = req.params.name;
        const models = await this.providerConfigurationRepo.getProviderConfigurations({ modelProvider: providerName });
        if(models.length === 0) {
            res.status(HttpStatus.NOT_FOUND)
                .send();
        }
        res.status(HttpStatus.OK)
            .json({ embeddingmodelparameters: models[0].embeddingModelParams });
    }

    @route('/:name/llmmodelparameters')
    @GET()
    async getLlmModelParametersForProvider(req: express.Request, res: express.Response) {
        this.logger.log('getEmbeddingModelsForProvider called;');
        const providerName = req.params.name;
        const models = await this.providerConfigurationRepo.getProviderConfigurations({ modelProvider: providerName });
        if(models.length === 0) {
            res.status(HttpStatus.NOT_FOUND)
                .send();
        }
        res.status(HttpStatus.OK)
            .json({ embeddingmodelparameters: models[0].llmModelParams });
    }

}