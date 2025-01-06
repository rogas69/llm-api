import { DBContext } from "../database/dbcontext";
import { BoundaryRepository } from "./data/boundary.repository";
import { BoundaryConfigurationRepository } from "./data/boundaryconfiguration.repository";
import { ProviderConfigurationDto } from "./data/providerconfigurationdto";
import { ProviderConfigurationRepository } from "./data/providerconfiguration.repository";
import { ILogger } from "./ILogger";
import { EntitlementDTO } from "./data/entitlementdto";
import { EntitlementRepository } from "./data/entitlements.repository";

/**
 * This class is used to prepopulate the database with data used for testing.
 */
export class DataSeedService {
    constructor(
        private readonly logger: ILogger,
        private readonly boundaryRepo: BoundaryRepository,
        private readonly boundaryConfigurationRepo: BoundaryConfigurationRepository,
        private readonly providerConfigurationRepo: ProviderConfigurationRepository,
        private readonly entitlementRepo: EntitlementRepository,
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
                await db.collection('entitlements').deleteMany({});
            });
    };

    private async seedBoundaries(): Promise<void> {
        await this.boundaryRepo.insertBoundary({ name: 'alpha', description: 'Test boundary 1' });
        await this.boundaryRepo.insertBoundary({ name: 'beta', description: 'Test boundary 2' });
        await this.boundaryRepo.insertBoundary({ name: 'gamma', description: 'Test boundary 3' });
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

    private async seedEntitlements(): Promise<void> {
        const entitlements: EntitlementDTO[] = [
            { userid: 'user1', roles: ['admin'],          boundaries: []},
            { userid: 'user2', roles: ['admin', 'user'],  boundaries: ['boundary2', 'boundary3']},
            { userid: 'user3', roles: ['user'],           boundaries: ['boundary1', 'boundary3']}
        ];

        for (const entitlement of entitlements) {
            await this.entitlementRepo.insertEntitlement(entitlement);
        }
    }
}