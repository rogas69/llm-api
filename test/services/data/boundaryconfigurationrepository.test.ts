
import { ILogger } from '../../../src/services/ILogger';
import { DBContext } from '../../../src/database/dbcontext';
import { BoundaryConfigurationRepository } from '../../../src/services/data/boundaryconfigurationrepository';
import { BoundaryConfigurationDto } from '../../../src/services/data/boundaryconfigurationdto';
import { ModelProvider } from '../../../src/services/types';
import { Collection, Db, FindCursor } from 'mongodb';

describe('BoundaryConfigurationRepository Tests', () => {
    let logger: ILogger;
    let dbContext: DBContext;
    let repository: BoundaryConfigurationRepository;
    let db: Db;
    let collection: Collection;
    let findCursor: FindCursor<BoundaryConfigurationDto>;

    const boundaryConfiguration: BoundaryConfigurationDto =
    {
        boundaryName: 'boundary1',
        llmModelName: 'model1',
        modelProvider: 'Ollama',
        embeddingsModelName: 'embedding1',
        comments: null
    };
    
    beforeEach(() => {
        logger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
        };

        findCursor = {
            toArray: jest.fn(),
        } as unknown as FindCursor<BoundaryConfigurationDto>;


        //.mockResolvedValue([boundaryConfiguration])
        collection = {
            find: jest.fn().mockReturnValue(findCursor),
            insertOne: jest.fn().mockResolvedValue({ "name": 'admin', "id": 'firstid', "description": 'some description' }),
            deleteOne: jest.fn().mockResolvedValue({ name: "admin" }),
        } as unknown as Collection;


        db = {
            collection: jest.fn().mockReturnValue(collection),
        } as unknown as Db;

        dbContext = {
            connectDatabase: jest.fn().mockResolvedValue(db),
        } as unknown as DBContext;

        repository = new BoundaryConfigurationRepository(logger, dbContext);
    });



    it('should get all boundary configurations without filters', async () => {
        findCursor.toArray = jest.fn().mockReturnValue([
            { boundaryName: 'boundary1', llmModelName: 'model1', modelProvider: 'Ollama', embeddingsModelName: 'embedding1' },
            { boundaryName: 'boundary2', llmModelName: 'model2', modelProvider: 'Ollama', embeddingsModelName: 'embedding2' }
        ]);

        const result = await repository.getBoundaryConfigurations({});

        expect(logger.log).toHaveBeenCalledWith('getBoundaryConfigurations called');
        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('boundary_configurations');
        expect(collection.find).toHaveBeenCalledWith({});
        expect(findCursor.toArray).toHaveBeenCalled();
        expect(result).toEqual([
            { boundaryName: 'boundary1', llmModelName: 'model1', modelProvider: 'Ollama', embeddingsModelName: 'embedding1' },
            { boundaryName: 'boundary2', llmModelName: 'model2', modelProvider: 'Ollama', embeddingsModelName: 'embedding2' }
        ]);
    });

    it('should get boundary configurations filtered by boundary name', async () => {
        findCursor.toArray = jest.fn().mockResolvedValue([
            { boundaryName: 'boundary1', llmModelName: 'model1', modelProvider: 'Ollama', embeddingsModelName: 'embedding1' }
        ]);

        const result = await repository.getBoundaryConfigurations({ boundaryName: 'boundary1' });

        expect(logger.log).toHaveBeenCalledWith('getBoundaryConfigurations called');
        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('boundary_configurations');
        expect(collection.find).toHaveBeenCalledWith({ $and: [{ boundaryName: 'boundary1' }] });
        expect(findCursor.toArray).toHaveBeenCalled();
        expect(result).toEqual([
            { boundaryName: 'boundary1', llmModelName: 'model1', modelProvider: 'Ollama', embeddingsModelName: 'embedding1' }
        ]);
    });

    it('should get boundary configurations filtered by model provider', async () => {
        findCursor.toArray = jest.fn().mockResolvedValue([
            { boundaryName: 'boundary1', llmModelName: 'model1', modelProvider: 'Ollama', embeddingsModelName: 'embedding1' }
        ]);

        const result = await repository.getBoundaryConfigurations({ modelProvider: 'Ollama' });

        expect(logger.log).toHaveBeenCalledWith('getBoundaryConfigurations called');
        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('boundary_configurations');
        expect(collection.find).toHaveBeenCalledWith({ $and: [{ modelProvider: 'Ollama' }] });
        expect(findCursor.toArray).toHaveBeenCalled();
        expect(result).toEqual([
            { boundaryName: 'boundary1', llmModelName: 'model1', modelProvider: 'Ollama', embeddingsModelName: 'embedding1' }
        ]);
    });

    it('should get boundary configurations filtered by boundary name and model provider', async () => {
        findCursor.toArray = jest.fn().mockResolvedValue([
            { boundaryName: 'boundary1', llmModelName: 'model1', modelProvider: 'Ollama', embeddingsModelName: 'embedding1' }
        ]);

        const result = await repository.getBoundaryConfigurations({ boundaryName: 'boundary1', modelProvider: 'Ollama' });

        expect(logger.log).toHaveBeenCalledWith('getBoundaryConfigurations called');
        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('boundary_configurations');
        expect(collection.find).toHaveBeenCalledWith({ $and: [{ boundaryName: 'boundary1' }, { modelProvider: 'Ollama' }] });
        expect(findCursor.toArray).toHaveBeenCalled();
        expect(result).toEqual([
            { boundaryName: 'boundary1', llmModelName: 'model1', modelProvider: 'Ollama', embeddingsModelName: 'embedding1' }
        ]);
    });

    it('should handle error when getting boundary configurations', async () => {
        findCursor.toArray = jest.fn().mockRejectedValue(new Error('Database error'));

        await expect(repository.getBoundaryConfigurations({})).rejects.toThrow('Database error');

        expect(logger.log).toHaveBeenCalledWith('getBoundaryConfigurations called');
        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('boundary_configurations');
        expect(collection.find).toHaveBeenCalledWith({});
        expect(findCursor.toArray).toHaveBeenCalled();
    });


    it('should insert a boundary configuration', async () => {
        const boundaryConfiguration: BoundaryConfigurationDto = {
            boundaryName: 'boundary1',
            modelProvider: 'Ollama',
            llmModelName: 'model1',
            embeddingsModelName: 'embedding1',
            comments: null
        };
        collection.findOne = jest.fn().mockResolvedValue(true);
        collection.insertOne = jest.fn().mockResolvedValue({});

        const result = await repository.insertBoundaryConfiguration(boundaryConfiguration);

        expect(logger.log).toHaveBeenCalledWith('Boundary configuration boundary1 inserted');
        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('boundaries');
        expect(collection.findOne).toHaveBeenCalledWith({ name: 'boundary1' });
        expect(db.collection).toHaveBeenCalledWith('boundary_configurations');
        expect(collection.insertOne).toHaveBeenCalledWith(boundaryConfiguration);
        expect(result).toBe(true);
    });

    it('should not insert a boundary configuration with invalid data', async () => {
        const boundaryConfiguration: BoundaryConfigurationDto = {
            boundaryName: '',
            llmModelName: '',
            modelProvider: '' as ModelProvider,
            embeddingsModelName: '',
            comments: ''
        };

        const result = await repository.insertBoundaryConfiguration(boundaryConfiguration);

        expect(logger.warn).toHaveBeenCalledWith('Error inserting boundary configuration - invalid data passed.');
        expect(result).toBe(false);
    });

    it('should not insert a boundary configuration when an exception is thrown during insertion', async () => {
        const boundaryConfiguration: BoundaryConfigurationDto = {
            boundaryName: 'TestBoundary',
            modelProvider: 'OpenAI',
            llmModelName: 'TestModel',
            embeddingsModelName: 'TestEmbeddings',
            comments: null
        };
        const errorMessage = 'Database error';

        collection.findOne = jest.fn().mockResolvedValue({ name: 'TestBoundary' });
        collection.insertOne = jest.fn().mockRejectedValue(new Error(errorMessage));

        const result = await repository.insertBoundaryConfiguration(boundaryConfiguration);

        expect(result).toBe(false);
        expect(logger.error).toHaveBeenCalledWith(`Error inserting boundary configuration ${boundaryConfiguration.boundaryName}: Error: ${errorMessage}`);
    });

    it('should not insert a boundary configuration if boundary does not exist', async () => {
        const boundaryConfiguration: BoundaryConfigurationDto = {
            boundaryName: 'boundary1',
            modelProvider: 'Ollama',
            llmModelName: 'model1',
            embeddingsModelName: 'embedding1',
            comments: ''
        };
        collection.findOne = jest.fn().mockResolvedValue(false);

        const result = await repository.insertBoundaryConfiguration(boundaryConfiguration);

        expect(logger.error).toHaveBeenCalledWith('Error inserting boundary configuration - boundary boundary1 does not exist.');
        expect(result).toBe(false);
    });

    it('should update a boundary configuration', async () => {
        const boundaryConfiguration: BoundaryConfigurationDto = {
            boundaryName: 'boundary1',
            modelProvider: 'Ollama',
            llmModelName: 'model1',
            embeddingsModelName: 'embedding1',
            comments: ''
        };

        collection.updateOne = jest.fn().mockResolvedValue({});

        const result = await repository.updateBoundaryConfiguration(boundaryConfiguration);

        expect(logger.log).toHaveBeenCalledWith('Boundary configuration boundary1 updated');
        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('boundary_configurations');
        expect(collection.updateOne).toHaveBeenCalledWith({ boundaryName: 'boundary1' }, { $set: boundaryConfiguration }, { upsert: false });
        expect(result).toBe(true);
    });

    it('should not update a boundary configuration with invalid data', async () => {

        const boundaryConfiguration: BoundaryConfigurationDto = {
            boundaryName: '',
            llmModelName: '',
            modelProvider: '' as ModelProvider,
            embeddingsModelName: '',
            comments: ''
        };

        const result = await repository.updateBoundaryConfiguration(boundaryConfiguration);

        expect(logger.warn).toHaveBeenCalledWith('Error updating boundary configuration - invalid data passed.');
        expect(result).toBe(false);
    });

    it('should not update a boundary configuration when an exception is thrown during update', async () => {
        const boundaryConfiguration: BoundaryConfigurationDto = {
            boundaryName: 'TestBoundary',
            modelProvider: 'OpenAI',
            llmModelName: 'TestModel',
            embeddingsModelName: 'TestEmbeddings',
            comments: null
        };
        const errorMessage = 'Database error';

        collection.updateOne = jest.fn().mockRejectedValue(new Error(errorMessage));

        const result = await repository.updateBoundaryConfiguration(boundaryConfiguration);

        expect(result).toBe(false);
        expect(logger.error).toHaveBeenCalledWith(`Error updating boundary configuration ${boundaryConfiguration.boundaryName}: Error: ${errorMessage}`);
    });

    it('should not update a boundary configuration with invalid data - null properties', async () => {

        const boundaryConfiguration: BoundaryConfigurationDto = {
            boundaryName: null as unknown as string,
            llmModelName: null as unknown as string,
            modelProvider: null as unknown as ModelProvider,
            embeddingsModelName: null as unknown as string,
            comments: ''
        };

        const result = await repository.updateBoundaryConfiguration(boundaryConfiguration);

        expect(logger.warn).toHaveBeenCalledWith('Error updating boundary configuration - invalid data passed.');
        expect(result).toBe(false);
    });


    it('should delete a boundary configuration by boundary name', async () => {
        collection.deleteOne = jest.fn().mockResolvedValue({});

        const result = await repository.deleteBoundaryConfigurationByBoundaryName('boundary1');

        expect(logger.log).toHaveBeenCalledWith('Boundary configuration boundary1 deleted');
        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('boundary_configurations');
        expect(collection.deleteOne).toHaveBeenCalledWith({ boundaryName: 'boundary1' });
        expect(result).toBe(true);
    });

    it('should handle error when deleting a boundary configuration', async () => {
        collection.deleteOne = jest.fn().mockRejectedValue(new Error('Delete failed'));

        const result = await repository.deleteBoundaryConfigurationByBoundaryName('boundary1');

        expect(logger.error).toHaveBeenCalledWith('Error deleting boundary configuration boundary1: Error: Delete failed');
        expect(result).toBe(false);
    });
});
