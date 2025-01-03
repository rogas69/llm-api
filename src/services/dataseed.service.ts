import { DBContext } from "../database/dbcontext";
import { BoundariesRepository } from "./data/boundariesrepository";
import { BoundaryConfigurationRepository } from "./data/boundaryconfigurationrepository";
import { ProviderConfigurationDto } from "./data/providerconfigurationdto";
import { ProviderConfigurationRepository } from "./data/providerconfigurationrepository";
import { ILogger } from "./ILogger";

/**
 * This class is used to prepopulate the database with data used for testing.
 */
export class DataSeedService {
    constructor(
        private readonly logger: ILogger,
        private readonly boundariesRepo: BoundariesRepository,
        private readonly boundaryConfigurationRepo: BoundaryConfigurationRepository,
        private readonly providerConfigurationRepo: ProviderConfigurationRepository,
        private readonly dbContext: DBContext
    ) { }

    public seedData(): void {
        this.logger.log('Cleaning data...');
        this.cleanTestingData();
        this.logger.log('Seeding data...');
        this.seedBoundaries();
        this.seedBoundaryConfigurations();
        this.seedProviderConfigurations()
    }

    

    private async cleanTestingData(): Promise<void> {
        await this.dbContext
            .connectDatabase()
            .then(async db => {
                await db.collection('boundaries').deleteMany({});
                await db.collection('boundary_configurations').deleteMany({});
                await db.collection('provider_configurations').deleteMany({});
            });
    };

    private async seedBoundaries(): Promise<void> {
        await this.boundariesRepo.insertBoundary({ name: 'alpha', description: 'Test boundary 1' });
        await this.boundariesRepo.insertBoundary({ name: 'beta', description: 'Test boundary 2' });
        await this.boundariesRepo.insertBoundary({ name: 'gamma', description: 'Test boundary 3' });
    }

    private async seedBoundaryConfigurations(): Promise<void> {
        await this.boundaryConfigurationRepo
            .insertBoundaryConfiguration({
                boundaryName: 'alpha',
                modelProvider: 'Ollama',
                llmModelName: "some model",
                embeddingsModelName: "some embedding model",
                comments: null
            });

        await this.boundaryConfigurationRepo
            .insertBoundaryConfiguration({
                boundaryName: 'beta',
                modelProvider: 'Ollama',
                llmModelName: "some model",
                embeddingsModelName: "some embedding model",
                comments: null
            });

        await this.boundaryConfigurationRepo
            .insertBoundaryConfiguration({
                boundaryName: 'gamma',
                modelProvider: 'Ollama',
                llmModelName: "some model",
                embeddingsModelName: "some embedding model",
                comments: null
            });
    }

    private async seedProviderConfigurations(): Promise<void> {
        const providerConfigurations: ProviderConfigurationDto[] = [
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

        for (const config of providerConfigurations) {
            await this.providerConfigurationRepo.insertProviderConfiguration(config);
        }
    }
}