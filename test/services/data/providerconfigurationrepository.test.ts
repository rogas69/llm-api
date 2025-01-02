import { GetProviderConfigurationsParams, ProviderConfigurationRepository } from '../../../src/services/data/providerconfigurationrepository';
import { DBContext } from '../../../src/database/dbcontext';
import { ILogger } from '../../../src/services/ILogger';
import { ProviderConfigurationDto } from '../../../src/services/data/providerconfigurationdto';
import { Collection, Db, Filter, FindCursor, ObjectId, WithId } from 'mongodb';

describe('ProviderConfigurationRepository Tests', () => {
    let providerConfigurationRepository: ProviderConfigurationRepository;
let logger: ILogger;
    let dbContext: DBContext;
    let db: Db;
    let collection: Collection;
    let findCursor: FindCursor<ProviderConfigurationDto>;
    
    beforeEach(() => {
        logger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
        };

        findCursor = {
            toArray: jest.fn(),
        } as unknown as FindCursor<ProviderConfigurationDto>;


        collection = {
            find: jest.fn().mockReturnValue(findCursor),
            findOne: jest.fn().mockReturnValue(findCursor)
        } as unknown as Collection;


        db = {
            collection: jest.fn().mockReturnValue(collection),
        } as unknown as Db;

        dbContext = {
            connectDatabase: jest.fn().mockResolvedValue(db),
        } as unknown as DBContext;

        providerConfigurationRepository = new ProviderConfigurationRepository(logger, dbContext);
    });

    it('should log a message and return an empty array when no provider configurations are found', async () => {
        const params = { modelProvider: 'Ollama' };
        const result = await providerConfigurationRepository.getProviderConfigurations(params);

        expect(logger.log).toHaveBeenCalledWith('getProviderConfigurations called');
        expect(result).toEqual([]);
    });

    it('should log a message and return an empty array when no provider models are found', async () => {
        const params = { modelProvider: 'Ollama' };
        const result = await providerConfigurationRepository.getProviderModels(params);

        expect(logger.log).toHaveBeenCalledWith('getProviderModels called');
        expect(result).toEqual([]);
    });

    it('should return an empty array when no matching document is found', async () => {
        const params: GetProviderConfigurationsParams = { modelProvider: 'Ollama' };

        collection.findOne = jest.fn().mockResolvedValue(null);

        const result = await providerConfigurationRepository.getProviderModels(params);

        expect(result).toEqual([]);
        expect(logger.log).toHaveBeenCalledWith('getProviderModels called');
        expect(collection.findOne).toHaveBeenCalledWith({ modelProvider: 'Ollama' });
    });

    it('should return provider configurations when found', async () => {
        const mockConfigurations: WithId<ProviderConfigurationDto>[] = [
            {
                _id: new ObjectId(1234),
                modelProvider: 'Ollama',
                llmModelNames: ['model1', 'model2'],
                embeddingsModelNames: ['embedding1', 'embedding2'],
                llmModelParams: { baseUrl: 'http://localhost:11434' },
                embeddingModelParams: { baseUrl: 'http://localhost:11434' }
            }
        ];

        ((await dbContext.connectDatabase()).collection('providerConfigurations').find().toArray as jest.Mock).mockResolvedValue(mockConfigurations);

        const params = { modelProvider: 'Ollama' };
        const result = await providerConfigurationRepository.getProviderConfigurations(params);

        expect(result).toEqual(mockConfigurations);
    });

    it('should return provider models when found', async () => {
        const mockConfiguration: WithId<ProviderConfigurationDto> = {
            _id: new ObjectId(1234),
            modelProvider: 'Ollama',
            llmModelNames: ['model1', 'model2'],
            embeddingsModelNames: ['embedding1', 'embedding2'],
            llmModelParams: { baseUrl: 'http://localhost:11434' },
            embeddingModelParams: { baseUrl: 'http://localhost:11434' }
        };

        collection.findOne  = jest.fn().mockResolvedValue(mockConfiguration);

        const params = { modelProvider: 'Ollama' };
        const result = await providerConfigurationRepository.getProviderModels(params);

        expect(result).toEqual(mockConfiguration.llmModelNames);
    });

    it('should build filter correctly when modelProvider is provided', () => {
        const modelProvider = 'Ollama';
        const filter = providerConfigurationRepository['buildFilter'](modelProvider);

        expect(filter).toEqual({ modelProvider });
    });

    it('should build filter correctly when modelProvider is not provided', () => {
        const filter = providerConfigurationRepository['buildFilter'](undefined);

        expect(filter).toEqual({});
    });
});