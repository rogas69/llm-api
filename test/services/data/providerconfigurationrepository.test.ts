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
            findOne: jest.fn().mockReturnValue(findCursor),
            insertOne: jest.fn()
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

        collection.findOne = jest.fn().mockResolvedValue(mockConfiguration);

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

    it('should insert a valid provider configuration and return true', async () => {
        const providerConfiguration: ProviderConfigurationDto = {
            modelProvider: 'Ollama',
            llmModelNames: ['model1', 'model2'],
            embeddingsModelNames: ['embedding1', 'embedding2'],
            llmModelParams: { model: 'SomeModel', baseUrl: 'http://localhost:11434' },
            embeddingModelParams: { model: "some embedding model", baseUrl: 'http://localhost:11434' }
        };

        collection.insertOne = jest.fn().mockResolvedValue({ acknowledged: true });

        const result = await providerConfigurationRepository.insertProviderConfiguration(providerConfiguration);

        expect(result).toBe(true);
        expect(collection.insertOne).toHaveBeenCalledWith(providerConfiguration);
    });

    it('should return false and log an error if  list of LLM models is empty', async () => {
        const invalidProviderConfiguration: ProviderConfigurationDto = {
            modelProvider: 'Ollama',
            llmModelNames: [],
            embeddingsModelNames: ['embedding1', 'embedding2'],
            llmModelParams: { model: 'SomeModel',baseUrl: 'http://localhost:11434' },
            embeddingModelParams: { baseUrl: 'http://localhost:11434' }
        };

        const result = await providerConfigurationRepository.insertProviderConfiguration(invalidProviderConfiguration);

        expect(result).toBe(false);
        expect(logger.error).toHaveBeenCalledWith('Error inserting provider configuration - invalid data passed.');
        expect(collection.insertOne).not.toHaveBeenCalled();
    });

    it('should return false and log an error if llmModelParams property is not provided', async () => {
        const invalidProviderConfiguration = {
            modelProvider: 'Ollama',
            llmModelNames: ['model1', 'model2'],
            embeddingsModelNames: [],
            embeddingModelParams: { baseUrl: 'http://localhost:11434' }
        } as unknown as ProviderConfigurationDto;

        const result = await providerConfigurationRepository.insertProviderConfiguration(invalidProviderConfiguration);

        expect(result).toBe(false);
        expect(logger.error).toHaveBeenCalledWith('Error inserting provider configuration - invalid data passed.');
        expect(collection.insertOne).not.toHaveBeenCalled();
    });


    it('should return false and log an error if llmModelParams property is empty', async () => {
        const invalidProviderConfiguration = {
            modelProvider: 'Ollama',
            llmModelNames: ['model1', 'model2'],
            llmmodelParams: {},
            embeddingsModelNames: [],
            embeddingModelParams: { baseUrl: 'http://localhost:11434' }
        } as unknown as ProviderConfigurationDto;

        const result = await providerConfigurationRepository.insertProviderConfiguration(invalidProviderConfiguration);

        expect(result).toBe(false);
        expect(logger.error).toHaveBeenCalledWith('Error inserting provider configuration - invalid data passed.');
        expect(collection.insertOne).not.toHaveBeenCalled();
    });

    it('should return false and log an error if llmModelParams property is null', async () => {
        const invalidProviderConfiguration = {
            modelProvider: 'Ollama',
            llmModelNames: ['model1', 'model2'],
            llmModelParams: null,
            embeddingsModelNames: [],
            embeddingModelParams: { baseUrl: 'http://localhost:11434' }
        } as unknown as ProviderConfigurationDto;

        const result = await providerConfigurationRepository.insertProviderConfiguration(invalidProviderConfiguration);

        expect(result).toBe(false);
        expect(logger.error).toHaveBeenCalledWith('Error inserting provider configuration - invalid data passed.');
        expect(collection.insertOne).not.toHaveBeenCalled();
    });

    it('should return false and log an error if llmModelParams property doesnt contain property model', async () => {
        const invalidProviderConfiguration = {
            modelProvider: 'Ollama',
            llmModelNames: ['model1', 'model2'],
            llmModelParams: { baseUrl: 'http://localhost:11434' },
            embeddingsModelNames: ['embedding1', 'embedding2'],
            embeddingModelParams: { baseUrl: 'http://localhost:11434' }
        } as unknown as ProviderConfigurationDto;

        const result = await providerConfigurationRepository.insertProviderConfiguration(invalidProviderConfiguration);

        expect(result).toBe(false);
        expect(logger.error).toHaveBeenCalledWith('Error inserting provider configuration - invalid data passed.');
        expect(collection.insertOne).not.toHaveBeenCalled();
    });


    it('should return false and log an error if list of embedding models is empty', async () => {
        const invalidProviderConfiguration: ProviderConfigurationDto = {
            modelProvider: 'Ollama',
            llmModelNames: ['model1', 'model2'],
            embeddingsModelNames: [],
            llmModelParams: { baseUrl: 'http://localhost:11434' },
            embeddingModelParams: { baseUrl: 'http://localhost:11434' }
        };

        const result = await providerConfigurationRepository.insertProviderConfiguration(invalidProviderConfiguration);

        expect(result).toBe(false);
        expect(logger.error).toHaveBeenCalledWith('Error inserting provider configuration - invalid data passed.');
        expect(collection.insertOne).not.toHaveBeenCalled();
    });

    it('should return false if insertOne operation fails', async () => {
        const providerConfiguration: ProviderConfigurationDto = {
            modelProvider: 'Ollama',
            llmModelNames: ['model1', 'model2'],
            embeddingsModelNames: ['embedding1', 'embedding2'],
            llmModelParams: { model: 'someModel', baseUrl: 'http://localhost:11434' },
            embeddingModelParams: { model: "some embedding model", baseUrl: 'http://localhost:11434' }
        };

        collection.insertOne = jest.fn().mockResolvedValue({ acknowledged: false });

        const result = await providerConfigurationRepository.insertProviderConfiguration(providerConfiguration);

        expect(result).toBe(false);
        expect(collection.insertOne).toHaveBeenCalledWith(providerConfiguration);
    });

    it('should validate provider configuration correctly', () => {
        const emptyModelProviderConfiguration = {
            modelProvider: '',
            llmModelNames: ['model1', 'model2'],
            embeddingsModelNames: ['embedding1', 'embedding2'],
            llmModelParams: { model: 'someModel', baseUrl: 'http://localhost:11434' },
            embeddingModelParams: { baseUrl: 'http://localhost:11434' }
        } as unknown as ProviderConfigurationDto;

        const validProviderConfiguration: ProviderConfigurationDto = {
            modelProvider: 'Ollama',
            llmModelNames: ['model1', 'model2'],
            embeddingsModelNames: ['embedding1', 'embedding2'],
            llmModelParams: { model: 'someModel', baseUrl: 'http://localhost:11434' },
            embeddingModelParams: { model: "embeddingModel", baseUrl: 'http://localhost:11434' }
        };

        const validGoogleProviderConfiguration: ProviderConfigurationDto = {
            modelProvider: 'GoogleAI',
            llmModelNames: ['model1', 'model2'],
            embeddingsModelNames: ['embedding1', 'embedding2'],
            llmModelParams: { model: 'someModel', baseUrl: 'http://localhost:11434' },
            embeddingModelParams: { model: 'google embedding model',  baseUrl: 'http://localhost:11434' }
        };

        const validOllamaProviderConfiguration: ProviderConfigurationDto = {
            modelProvider: 'GoogleAI',
            llmModelNames: ['model1', 'model2'],
            embeddingsModelNames: ['embedding1', 'embedding2'],
            llmModelParams: { model: 'someModel', baseUrl: 'http://localhost:11434' },
            embeddingModelParams: { model: 'ollama embedding model',  baseUrl: 'http://localhost:11434' }
        };

        const validOpenAIProviderConfiguration: ProviderConfigurationDto = {
            modelProvider: 'GoogleAI',
            llmModelNames: ['model1', 'model2'],
            embeddingsModelNames: ['embedding1', 'embedding2'],
            llmModelParams: { model: 'someModel', baseUrl: 'http://localhost:11434' },
            embeddingModelParams: { model: 'OpenAI embedding model',  baseUrl: 'http://localhost:11434' }
        };

        const invalidOpenAIProviderConfiguration: ProviderConfigurationDto = {
            modelProvider: 'OpenAI',
            llmModelNames: ['model1', 'model2'],
            embeddingsModelNames: ['embedding1', 'embedding2'],
            llmModelParams: { model: 'someModel', baseUrl: 'http://localhost:11434' },
            embeddingModelParams: { baseUrl: 'http://localhost:11434' }
        };

        expect(providerConfigurationRepository.validateProviderConfiguration(validProviderConfiguration)).toBe(true);
        expect(providerConfigurationRepository.validateProviderConfiguration(validGoogleProviderConfiguration)).toBe(true);
        expect(providerConfigurationRepository.validateProviderConfiguration(validOllamaProviderConfiguration)).toBe(true);
        expect(providerConfigurationRepository.validateProviderConfiguration(validOpenAIProviderConfiguration)).toBe(true);
        expect(providerConfigurationRepository.validateProviderConfiguration(invalidOpenAIProviderConfiguration)).toBe(false);
        expect(providerConfigurationRepository.validateProviderConfiguration(emptyModelProviderConfiguration)).toBe(false);
    });

});