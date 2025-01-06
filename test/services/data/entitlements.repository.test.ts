import { EntitlementRepository } from '../../../src/services/data/entitlements.repository';
import { DBContext } from '../../../src/database/dbcontext';
import { EntitlementDTO } from '../../../src/services/data/entitlementdto';

describe('EntitlementRepository', () => {
    let dbContext: DBContext;
    let repository: EntitlementRepository;

    beforeEach(() => {
        dbContext = {
            connectDatabase: jest.fn()
        } as unknown as DBContext;
        repository = new EntitlementRepository(dbContext);
    });

    describe('isInRole', () => {
        it('should return true if user is in the role', async () => {
            const userId = 'user1';
            const role = 'admin';
            const entitlement: EntitlementDTO = { userid: userId, roles: [role], boundaries: [] };

            (dbContext.connectDatabase as jest.Mock).mockResolvedValue({
                collection: jest.fn().mockReturnValue({
                    findOne: jest.fn().mockResolvedValue(entitlement)
                })
            });

            const result = await repository.isInRole(userId, role);
            expect(result).toBe(true);
        });

        it('should return false if user is not in the role', async () => {
            const userId = 'user1';
            const role = 'admin';
            const entitlement: EntitlementDTO = { userid: userId, roles: ['user'], boundaries: [] };

            (dbContext.connectDatabase as jest.Mock).mockResolvedValue({
                collection: jest.fn().mockReturnValue({
                    findOne: jest.fn().mockResolvedValue(entitlement)
                })
            });

            const result = await repository.isInRole(userId, role);
            expect(result).toBe(false);
        });

        it('should return false if user is not found', async () => {
            const userId = 'user1';
            const role = 'admin';

            (dbContext.connectDatabase as jest.Mock).mockResolvedValue({
                collection: jest.fn().mockReturnValue({
                    findOne: jest.fn().mockResolvedValue(null)
                })
            });

            const result = await repository.isInRole(userId, role);
            expect(result).toBe(false);
        });
    });

    describe('isInBoundary', () => {
        it('should return true if user is in the boundary', async () => {
            const userId = 'user1';
            const boundary = 'boundary1';
            const entitlement: EntitlementDTO = { userid: userId, roles: [], boundaries: [boundary] };

            (dbContext.connectDatabase as jest.Mock).mockResolvedValue({
                collection: jest.fn().mockReturnValue({
                    findOne: jest.fn().mockResolvedValue(entitlement)
                })
            });

            const result = await repository.isInBoundary(userId, boundary);
            expect(result).toBe(true);
        });

        it('should return false if user is not in the boundary', async () => {
            const userId = 'user1';
            const boundary = 'boundary1';
            const entitlement: EntitlementDTO = { userid: userId, roles: [], boundaries: ['boundary2'] };

            (dbContext.connectDatabase as jest.Mock).mockResolvedValue({
                collection: jest.fn().mockReturnValue({
                    findOne: jest.fn().mockResolvedValue(entitlement)
                })
            });

            const result = await repository.isInBoundary(userId, boundary);
            expect(result).toBe(false);
        });

        it('should return false if user is not found', async () => {
            const userId = 'user1';
            const boundary = 'boundary1';

            (dbContext.connectDatabase as jest.Mock).mockResolvedValue({
                collection: jest.fn().mockReturnValue({
                    findOne: jest.fn().mockResolvedValue(null)
                })
            });

            const result = await repository.isInBoundary(userId, boundary);
            expect(result).toBe(false);
        });
    });
    describe('insertEntitlement', () => {
        it('should return true when entitlement is successfully inserted', async () => {
            const entitlement: EntitlementDTO = { userid: 'user1', roles: ['admin'], boundaries: [] };

            (dbContext.connectDatabase as jest.Mock).mockResolvedValue({
                collection: jest.fn().mockReturnValue({
                    insertOne: jest.fn().mockResolvedValue({ acknowledged: true })
                })
            });

            const result = await repository.insertEntitlement(entitlement);
            expect(result).toBe(true);
        });

        it('should return false when entitlement insertion fails', async () => {
            const entitlement: EntitlementDTO = { userid: 'user1', roles: ['admin'], boundaries: [] };

            (dbContext.connectDatabase as jest.Mock).mockResolvedValue({
                collection: jest.fn().mockReturnValue({
                    insertOne: jest.fn().mockResolvedValue({ acknowledged: false })
                })
            });

            const result = await repository.insertEntitlement(entitlement);
            expect(result).toBe(false);
        });

        it('should handle errors during entitlement insertion', async () => {
            const entitlement: EntitlementDTO = { userid: 'user1', roles: ['admin'], boundaries: [] };

            (dbContext.connectDatabase as jest.Mock).mockResolvedValue({
                collection: jest.fn().mockReturnValue({
                    insertOne: jest.fn().mockRejectedValue(new Error('Insertion error'))
                })
            });

            await expect(repository.insertEntitlement(entitlement)).rejects.toThrow('Insertion error');
        });
    });
});