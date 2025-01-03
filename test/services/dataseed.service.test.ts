import { DataSeedService } from '../../src/services/dataseed.service';
import { BoundariesRepository } from '../../src/services/data/boundariesrepository';
import { BoundaryConfigurationRepository } from '../../src/services/data/boundaryconfigurationrepository';
import { DBContext } from '../../src/database/dbcontext';
import { ILogger } from '../../src/services/ILogger';
import { ProviderConfigurationRepository } from '../../src/services/data/providerconfigurationrepository';
import { ProviderConfigurationDto } from '../../src/services/data/providerconfigurationdto';

describe('DataSeedService Tests', () => {
    let dataSeedService: DataSeedService;
    let mockLogger: ILogger;
    let mockBoundariesRepo: BoundariesRepository;
    let mockBoundaryConfigurationRepo: BoundaryConfigurationRepository;
    let mockproviderConfigurationRepo: ProviderConfigurationRepository;
    let mockDbContext: DBContext;

    beforeEach(() => {
        mockLogger = {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };

        mockBoundariesRepo = {
            insertBoundary: jest.fn()
        } as unknown as BoundariesRepository;

        mockBoundaryConfigurationRepo = {
            insertBoundaryConfiguration: jest.fn()
        } as unknown as BoundaryConfigurationRepository;

        mockproviderConfigurationRepo = {
            insertProviderConfiguration: jest.fn(),
            validateProviderConfiguration: jest.fn()
        } as unknown as ProviderConfigurationRepository

        mockDbContext = {
            connectDatabase: jest.fn().mockResolvedValue({
                collection: jest.fn().mockReturnValue({
                    deleteMany: jest.fn().mockResolvedValue({})
                })
            })
        } as unknown as DBContext;

        dataSeedService = new DataSeedService(
            mockLogger,
            mockBoundariesRepo,
            mockBoundaryConfigurationRepo,
            mockproviderConfigurationRepo,
            mockDbContext);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should log messages and call cleanTestingData, seedBoundaries, and seedBoundaryConfigurations when seedData is called', async () => {
        jest.spyOn(dataSeedService as any, 'cleanTestingData').mockImplementation(() => jest.fn());
        jest.spyOn(dataSeedService as any, 'seedBoundaries').mockImplementation(jest.fn());
        jest.spyOn(dataSeedService as any, 'seedBoundaryConfigurations').mockImplementation(jest.fn());
        jest.spyOn(dataSeedService as any, 'seedProviderConfigurations').mockImplementation(jest.fn());

        await dataSeedService.seedData();

        expect(mockLogger.log).toHaveBeenCalledWith('Cleaning data...');
        expect((dataSeedService as any).cleanTestingData).toHaveBeenCalled();
        expect(mockLogger.log).toHaveBeenCalledWith('Seeding data...');
        expect((dataSeedService as any).seedBoundaries).toHaveBeenCalled();
        expect((dataSeedService as any).seedBoundaryConfigurations).toHaveBeenCalled();
        expect((dataSeedService as any).seedProviderConfigurations).toHaveBeenCalled();
    });

    it('should clean testing data by deleting all documents in boundaries and boundary_configurations collections', async () => {
        await (dataSeedService as any).cleanTestingData();

        const db = await mockDbContext.connectDatabase();
        expect(db.collection('boundaries').deleteMany).toHaveBeenCalledWith({});
        expect(db.collection('boundary_configurations').deleteMany).toHaveBeenCalledWith({});
    });

    it('should seed boundaries by inserting predefined boundaries', async () => {
        await (dataSeedService as any).seedBoundaries();

        expect(mockBoundariesRepo.insertBoundary).toHaveBeenCalledWith({ name: 'alpha', description: 'Test boundary 1' });
        expect(mockBoundariesRepo.insertBoundary).toHaveBeenCalledWith({ name: 'beta', description: 'Test boundary 2' });
        expect(mockBoundariesRepo.insertBoundary).toHaveBeenCalledWith({ name: 'gamma', description: 'Test boundary 3' });
    });

    it('should seed boundary configurations by inserting predefined boundary configurations', async () => {
        await (dataSeedService as any).seedBoundaryConfigurations();

        expect(mockBoundaryConfigurationRepo.insertBoundaryConfiguration).toHaveBeenCalledWith({
            boundaryName: 'alpha',
            modelProvider: 'Ollama',
            llmModelName: "some model",
            embeddingsModelName: "some embedding model",
            comments: null
        });

        expect(mockBoundaryConfigurationRepo.insertBoundaryConfiguration).toHaveBeenCalledWith({
            boundaryName: 'beta',
            modelProvider: 'Ollama',
            llmModelName: "some model",
            embeddingsModelName: "some embedding model",
            comments: null
        });

        expect(mockBoundaryConfigurationRepo.insertBoundaryConfiguration).toHaveBeenCalledWith({
            boundaryName: 'gamma',
            modelProvider: 'Ollama',
            llmModelName: "some model",
            embeddingsModelName: "some embedding model",
            comments: null
        });
    });

    it('should seed provider configurations by inserting predefined provider configurations', async () => {
        const providerConfigurations = [
            new ProviderConfigurationDto(
                'Ollama',
                ['model1', 'model2'],
                ['embedding1', 'embedding2'],
                { baseUrl: 'http://localhost:11434' },
                { baseUrl: 'http://localhost:11434', maxConcurrency: 5 }
            ),
            new ProviderConfigurationDto(
                'OpenAI',
                ['gpt-3', 'gpt-3.5'],
                ['embedding1', 'embedding2'],
                { apiKey: 'your-openai-api-key', model: 'gpt-3' },
                { apiKey: 'your-openai-api-key', model: 'embedding1' }
            ),
            new ProviderConfigurationDto(
                'GoogleAI',
                ['model1', 'model2'],
                ['embedding1', 'embedding2'],
                { apiKey: 'your-google-api-key', model: 'model1' },
                { apiKey: 'your-google-api-key', model: 'embedding1' }
            )
        ];

        mockproviderConfigurationRepo.insertProviderConfiguration = jest.fn().mockResolvedValue(true);

        await (dataSeedService as any).seedProviderConfigurations();

        for (const config of providerConfigurations) {
            expect(mockproviderConfigurationRepo.insertProviderConfiguration).toHaveBeenCalledWith(config);
        }
    });
});