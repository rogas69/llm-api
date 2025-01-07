import { AuthorizationService } from '../../src/services/authorization.service';
import { BoundaryRepository } from '../../src/services/data/boundary.repository';
import { EntitlementRepository } from '../../src/services/data/entitlements.repository';
import { ILogger } from '../../src/services/ILogger';
import * as express from 'express';

describe('AuthorizationService', () => {
    let logger: ILogger;
    let boundaryRepo: BoundaryRepository;
    let entitlementRepo: EntitlementRepository;
    let requiredRoles: string[];
    let requiredBoundaries: string[];
    let authorizationService: AuthorizationService;

    beforeEach(() => {
        logger = {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        } as unknown as ILogger;

        boundaryRepo = {} as BoundaryRepository;
        entitlementRepo = {
            isInRole: jest.fn(),
            isInBoundary: jest.fn(),
        } as unknown as EntitlementRepository;

        requiredRoles = ['admin', 'user'];
        requiredBoundaries = ['boundary1', 'boundary2'];

        authorizationService = new AuthorizationService(logger,
            entitlementRepo,
            requiredRoles,
            requiredBoundaries);
    });


    describe('authorizeRole', () => {
        it('should return true if user has any required role', async () => {
            entitlementRepo.isInRole = jest.fn().mockResolvedValue(true);

            const req = {
                header: jest.fn().mockReturnValue('user1')
            } as unknown as express.Request;
            const res = {} as express.Response;

            const result = await authorizationService.authorizeRole(req, res);

            expect(result).toBe(true);
            expect(logger.log).toHaveBeenCalledWith('authorizeRole called with user: user1');
        });

        it('should return false if user does not have any required role', async () => {
            entitlementRepo.isInRole = jest.fn().mockResolvedValue(false);

            const req = {
                header: jest.fn().mockReturnValue('user1')
            } as unknown as express.Request;
            const res = {} as express.Response;

            const result = await authorizationService.authorizeRole(req, res);

            expect(result).toBe(false);
            expect(logger.log).toHaveBeenCalledWith('authorizeRole called with user: user1');
            expect(logger.warn).toHaveBeenCalledWith('authorizeRole failed for user: user1');
        });

        it('should return false if user not provided in the header', async () => {
            entitlementRepo.isInRole = jest.fn().mockResolvedValue(false);

            const req = {
                header: jest.fn().mockReturnValue(null)
            } as unknown as express.Request;
            const res = {} as express.Response;

            const result = await authorizationService.authorizeRole(req, res);

            expect(result).toBe(false);
            expect(logger.log).toHaveBeenCalledWith('authorizeRole called with user: ');
            expect(logger.warn).toHaveBeenCalledWith('authorizeRole failed for user: ');
        });

        it('should handle errors gracefully', async () => {
            (entitlementRepo.isInRole as jest.Mock).mockRejectedValue(new Error('Database error'));

            const req = {
                header: jest.fn().mockReturnValue('user1')
            } as unknown as express.Request;
            const res = {} as express.Response;

            const result = await authorizationService.authorizeRole(req, res);

            expect(result).toBe(false);
            expect(logger.error).toHaveBeenCalledWith('authorizeRole failed: Database error');
        });
    });

    describe('authorizeBoundary', () => {
        it('should return true if user has any required boundary', async () => {
            (entitlementRepo.isInBoundary as jest.Mock).mockResolvedValue(true);

            const req = {
                header: jest.fn().mockReturnValue('user1')
            } as unknown as express.Request;
            const res = {} as express.Response;

            const result = await authorizationService.authorizeBoundary(req, res);

            expect(result).toBe(true);
            expect(logger.log).toHaveBeenCalledWith('authorizeBoundary called with user: user1');
        });

        it('should return false if user does not have any required boundary', async () => {
            entitlementRepo.isInBoundary = jest.fn().mockResolvedValue(false);
            const req = {
                header: jest.fn().mockReturnValue('user1')
            } as unknown as express.Request;
            const res = {} as express.Response;

            const result = await authorizationService.authorizeBoundary(req, res);

            expect(result).toBe(false);
            expect(logger.log).toHaveBeenCalledWith('authorizeBoundary called with user: user1');
            expect(logger.warn).toHaveBeenCalledWith('authorizeBoundary failed for user: user1');
        });

        it('should return false if user is not provided in the header', async () => {
            entitlementRepo.isInBoundary = jest.fn().mockResolvedValue(false);
        const req = {
                header: jest.fn().mockReturnValue(null)
            } as unknown as express.Request;
            const res = {} as express.Response;

            const result = await authorizationService.authorizeBoundary(req, res);

            expect(result).toBe(false);
            expect(logger.log).toHaveBeenCalledWith('authorizeBoundary called with user: ');
            expect(logger.warn).toHaveBeenCalledWith('authorizeBoundary failed for user: ');
        });


        it('should handle errors gracefully', async () => {
            (entitlementRepo.isInBoundary as jest.Mock).mockRejectedValue(new Error('Database error'));

            const req = {
                header: jest.fn().mockReturnValue('user1')
            } as unknown as express.Request;
            const res = {} as express.Response;

            const result = await authorizationService.authorizeBoundary(req, res);

            expect(result).toBe(false);
            expect(logger.error).toHaveBeenCalledWith('authorizeBoundary failed: Database error');
        });
    });
});