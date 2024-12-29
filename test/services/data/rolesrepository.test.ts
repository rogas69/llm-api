import { RolesRepository } from '../../../src/services/data/rolesrepository';
import { DBContext } from '../../../src/database/dbcontext';
import { MongoClient, Db, Collection, InsertOneResult, ObjectId } from 'mongodb';
import { ILogger } from '../../../src/services/ILogger';
import '../../../src/services/data/roledto'; // Import the namespace

describe('RolesRepository Tests', () => {
    let dbContext: DBContext;
    let dbClient: MongoClient;
    let db: Db;
    let collection: Collection;
    let logger: ILogger;
    let rolesRepository: RolesRepository;
    
    const role: ApiData.RoleDto = { id: 'firstid', name: 'admin', description: 'some description' };

    beforeEach(() => {


        collection = {
            find: jest.fn().mockReturnValue({
                toArray: jest.fn().mockResolvedValue([]),
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

        rolesRepository = new RolesRepository(dbContext);
    });

    it('should get all roles', async () => {
        const roles = await rolesRepository.getAllRoles();

        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('roles');
        expect(collection.find().toArray).toHaveBeenCalled();
        expect(roles).toEqual([]);
    });

    it('should get role by name', async () => {
        const roleName = 'admin';
        const roles = await rolesRepository.getRoleByName(roleName);

        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('roles');
        expect(collection.find).toHaveBeenCalledWith({ name: roleName });
        expect(collection.find().toArray).toHaveBeenCalled();
        expect(roles).toEqual([]);
    });

    it('should insert a role', async () => {
        //const role: ApiData.RoleDto = { id: 'firstid', name: 'admin', description: 'some description' };
        await rolesRepository.insertRole(role);

        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('roles');
        expect(collection.insertOne).toHaveBeenCalledWith(role);
    });

    it('should delete role by name', async () => {
        const roleName = 'admin';
        await rolesRepository.deleteRoleByName(roleName);

        expect(dbContext.connectDatabase).toHaveBeenCalled();
        expect(db.collection).toHaveBeenCalledWith('roles');
        expect(collection.deleteOne).toHaveBeenCalledWith({ name: "admin" });
       
    });

    it('should dispose dbContext', () => {
        rolesRepository[Symbol.dispose]();

        expect(dbContext[Symbol.dispose]).toHaveBeenCalled();
    });
});