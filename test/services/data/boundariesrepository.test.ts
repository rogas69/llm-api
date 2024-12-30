import { BoundariesRepository } from '../../../src/services/data/boundariesrepository';
import { DBContext } from '../../../src/database/dbcontext';
import { MongoClient, Db, Collection, InsertOneResult, ObjectId } from 'mongodb';
import { ILogger } from '../../../src/services/ILogger';
import '../../../src/services/data/boundarydto'; // Import the namespace
import { ApiData } from '../../../src/services/data/boundarydto';

describe('BoundariesRepository Tests', () => {
    let dbContext: DBContext;
    let dbClient: MongoClient;
    let db: Db;
    let collection: Collection;
    let logger: ILogger;
    let rolesRepository: BoundariesRepository;
    
    const boundary: ApiData.BoundaryDto = { name: 'admin', description: 'some description' };


    beforeEach(() => {


        collection = {
            find: jest.fn().mockReturnValue({
                toArray: jest.fn().mockResolvedValue([boundary]),
            }),
            insertOne: jest.fn().mockResolvedValue({ "name": 'admin', "id": 'firstid', "description": 'some description' }),
            deleteOne: jest.fn().mockResolvedValue({ name : "admin" }),
        } as unknown as Collection;

        db = {
            collection: jest.fn().mockReturnValue(collection),
        } as unknown as Db;

        dbClient = {
            connect: jest.fn().mockResolvedValue(undefined),
            db: jest.fn().mockReturnValue(db),
            close: jest.fn().mockResolvedValue(undefined),
        } as unknown as MongoClient;

        logger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
        };

        dbContext = {
            connectDatabase: jest.fn().mockReturnValue(db),
            [Symbol.dispose]: jest.fn(),
        } as unknown as DBContext;

        rolesRepository = new BoundariesRepository(logger, dbContext);
    });

    it('should get all boundaries', async () => {
        const roles = await rolesRepository.getAllBundaries();

        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('boundaries');
        expect(collection.find().toArray).toHaveBeenCalled();
        expect(roles).toEqual([boundary]);
    });

    it('should get boundary by name', async () => {
        const boundaryName = 'admin';
        const boundaries = await rolesRepository.getBoundaryByName(boundaryName);

        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('boundaries');
        expect(collection.find).toHaveBeenCalledWith({ name: boundaryName });
        expect(collection.find().toArray).toHaveBeenCalled();
        expect(boundaries).toEqual([boundary]);
    });

    it('should insert a boundary', async () => {
        //const role: ApiData.RoleDto = { id: 'firstid', name: 'admin', description: 'some description' };
        await rolesRepository.insertBoundary(boundary);

        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('boundaries');
        expect(collection.insertOne).toHaveBeenCalledWith(boundary);
    });

    it('should delete boundary by name', async () => {
        const roleName = 'admin';
        await rolesRepository.deleteBoundaryByName(roleName);

        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('boundaries');
        expect(collection.deleteOne).toHaveBeenCalledWith({ name: "admin" });
       
    });


    it('should update a boundary', async () => {
        const updatedBoundary: ApiData.BoundaryDto = { name: 'admin', description: 'updated description' };
        collection.updateOne = jest.fn().mockResolvedValue({ matchedCount: 1 });
    
        const result = await rolesRepository.updateBoundary(updatedBoundary);
    
        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('boundaries');
        expect(collection.updateOne).toHaveBeenCalledWith({ name: updatedBoundary.name }, updatedBoundary, { upsert: false });
        expect(result).toBe(true);
    });
    
    it('should handle update boundary failure', async () => {
        const updatedBoundary: ApiData.BoundaryDto = { name: 'admin', description: 'updated description' };
        collection.updateOne = jest.fn().mockRejectedValue(new Error('Update failed'));
    
        const result = await rolesRepository.updateBoundary(updatedBoundary);
    
        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('boundaries');
        expect(collection.updateOne).toHaveBeenCalledWith({ name: updatedBoundary.name }, updatedBoundary, { upsert: false });
        expect(result).toBe(false);
        expect(logger.error).toHaveBeenCalledWith('Error updating boundary admin: Error: Update failed');
    });
    
    it('should handle delete boundary by name not found', async () => {
        collection.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 0 });
    
        const result = await rolesRepository.deleteBoundaryByName('nonexistent');
    
        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('boundaries');
        expect(collection.deleteOne).toHaveBeenCalledWith({ name: 'nonexistent' });
        expect(result).toBe(false);
        expect(logger.warn).toHaveBeenCalledWith('Boundary nonexistent not found');
    });
    
    it('should handle delete boundary by name failure', async () => {
        collection.deleteOne = jest.fn().mockRejectedValue(new Error('Delete failed'));
    
        const result = await rolesRepository.deleteBoundaryByName('admin');
    
        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('boundaries');
        expect(collection.deleteOne).toHaveBeenCalledWith({ name: 'admin' });
        expect(result).toBe(false);
        expect(logger.error).toHaveBeenCalledWith('Error deleting boundary admin: Error: Delete failed');
    });

    it('should dispose dbContext', () => {
        rolesRepository[Symbol.dispose]();

        expect(dbContext[Symbol.dispose]).toHaveBeenCalled();
    });
});