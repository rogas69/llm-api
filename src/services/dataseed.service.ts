import { DBContext } from "../database/dbcontext";
import { BoundariesRepository } from "./data/boundariesrepository";
import { BoundaryConfigurationRepository } from "./data/boundaryconfigurationrepository";
import { ILogger } from "./ILogger";

/**
 * This class is used to prepopulate the database with data used for testing.
 */
export class DataSeedService {
    constructor(
        private readonly logger: ILogger,
        private readonly boundariesRepo: BoundariesRepository,
        private readonly boundaryConfigurationRepo: BoundaryConfigurationRepository,
        private readonly dbContext: DBContext
    ) { }

    public seedData(): void {
        this.logger.log('Cleaning data...');
        this.cleanTestingData();
        this.logger.log('Seeding data...');
        this.seedBoundaries();
        this.seedBoundaryConfigurations();
    }

    private async cleanTestingData(): Promise<void> {
        await this.dbContext
            .connectDatabase()
            .then(async db => {
                await db.collection('boundaries').deleteMany({});
                await db.collection('boundary_configurations').deleteMany({});
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

}