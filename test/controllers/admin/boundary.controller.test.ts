import express from 'express';
import request from 'supertest';
import { createContainer, asClass, asValue, asFunction } from 'awilix';
import { scopePerRequest, controller } from 'awilix-express';
import { BoundaryController } from '../../../src/controllers/admin/boundary.controller';
import { BoundaryRepository } from '../../../src/services/data/boundary.repository';
import { EntitlementRepository } from '../../../src/services/data/entitlements.repository';
import { ILogger } from '../../../src/services/ILogger';
import { BoundaryDto } from '../../../src/services/data/boundarydto';
import { HttpStatus } from 'http-status-ts';
import { AuthorizationService } from '../../../src/services/authorization.service';

describe('BoundaryController', () => {
    let app: express.Application;
    let logger: ILogger;
    let boundaryRepo: BoundaryRepository;
    let authorizationService: AuthorizationService;
    //let controller: BoundaryController;

    beforeEach(() => {
        const container = createContainer({ injectionMode: 'CLASSIC' });

        logger = {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        } as unknown as ILogger;

        boundaryRepo = {
            getAllBoundaries: jest.fn(),
            getBoundaryByName: jest.fn(),
            insertBoundary: jest.fn(),
            updateBoundary: jest.fn(),
            deleteBoundaryByName: jest.fn(),
        } as unknown as BoundaryRepository;


        authorizationService = {
            authorizeRole: jest.fn(),
            authorizeBoundary: jest.fn(),
        } as unknown as AuthorizationService;

        app = express();
        app.use(express.json());

        container.register({
            logger: asFunction(() => logger).scoped(),
            boundaryRepo: asValue(boundaryRepo),
            boundaryController: asClass(BoundaryController),
            requiredRolles: asValue(['admin', 'user']),
            requiredBoundaries: asValue(['boundary1', 'boundary2']),
            authorizationService: asValue(authorizationService),
        });

        app.use(scopePerRequest(container));

        const router = controller(BoundaryController);
        app.use(router);
    });


    test('GET /admin/boundaries should return all boundaries', async () => {
        const boundaries: BoundaryDto[] = [{ name: 'boundary1', description: 'desc1' }];
        (boundaryRepo.getAllBoundaries as jest.Mock).mockResolvedValue(boundaries);
        (authorizationService.authorizeRole as jest.Mock).mockResolvedValue(true);

        const response = await request(app).get('/admin/boundaries').set('userId', 'admin');

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.boundaries).toEqual(boundaries);
        expect(logger.log).toHaveBeenCalledWith('getAllBoundaries called;');
    });

    test('GET /admin/boundaries should return unauthorized if user is not admin', async () => {
        (authorizationService.authorizeRole as jest.Mock).mockResolvedValue(false);

        const response = await request(app).get('/admin/boundaries').set('userId', 'user');

        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('GET /admin/boundaries should handle errors gracefully', async () => {
        (boundaryRepo.getAllBoundaries as jest.Mock).mockRejectedValue(new Error('Database error'));
        (authorizationService.authorizeRole as jest.Mock).mockResolvedValue(true);

        const response = await request(app).get('/admin/boundaries').set('userId', 'admin');

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(logger.error).toHaveBeenCalledWith('Error getting boundaries: Database error');
    });

    test('GET /admin/boundaries/:name should return boundary by name', async () => {
        const boundaryName = 'boundary1';
        const boundaries: BoundaryDto[] = [{ name: boundaryName, description: 'desc1' }];
        (boundaryRepo.getBoundaryByName as jest.Mock).mockResolvedValue(boundaries);
        (authorizationService.authorizeRole as jest.Mock).mockResolvedValue(true);

        const response = await request(app).get(`/admin/boundaries/${boundaryName}`).set('userId', 'admin');

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body.boundaries).toEqual(boundaries);
        expect(logger.log).toHaveBeenCalledWith(`getBoundaryByName called with name: ${boundaryName}`);
    });

    test('GET /admin/boundaries/:name should return unauthorized if user is not admin', async () => {
        const boundaryName = 'boundary1';
        (authorizationService.authorizeRole as jest.Mock).mockResolvedValue(false);

        const response = await request(app).get(`/admin/boundaries/${boundaryName}`).set('userId', 'user');

        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('GET /admin/boundaries/:name should handle errors gracefully', async () => {
        const boundaryName = 'boundary1';
        (boundaryRepo.getBoundaryByName as jest.Mock).mockRejectedValue(new Error('Database error'));
        (authorizationService.authorizeRole as jest.Mock).mockResolvedValue(true);

        const response = await request(app).get(`/admin/boundaries/${boundaryName}`).set('userId', 'admin');

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(logger.error).toHaveBeenCalledWith('Error getting boundary by name: Database error');
    });

    test('POST /admin/boundaries should add a new boundary', async () => {
        const newBoundary: BoundaryDto = { name: 'boundary1', description: 'desc1' };
        (boundaryRepo.insertBoundary as jest.Mock).mockResolvedValue(true);
        (authorizationService.authorizeRole as jest.Mock).mockResolvedValue(true);
    
        const response = await request(app).post('/admin/boundaries').send(newBoundary).set('userId', 'admin');
    
        expect(response.status).toBe(HttpStatus.NO_CONTENT);
        expect(logger.log).toHaveBeenCalledWith(`addBoundary called with boundary: ${newBoundary.name}`);
    });
    
    test('POST /admin/boundaries should return BAD_REQUEST if insertion fails', async () => {
        const newBoundary: BoundaryDto = { name: 'boundary1', description: 'desc1' };
        (boundaryRepo.insertBoundary as jest.Mock).mockResolvedValue(false);
        (authorizationService.authorizeRole as jest.Mock).mockResolvedValue(true);
    
        const response = await request(app).post('/admin/boundaries').send(newBoundary).set('userId', 'admin');
    
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(logger.log).toHaveBeenCalledWith(`addBoundary called with boundary: ${newBoundary.name}`);
    });
    
    test('POST /admin/boundaries should return unauthorized if user is not admin', async () => {
        const newBoundary: BoundaryDto = { name: 'boundary1', description: 'desc1' };
        (authorizationService.authorizeRole as jest.Mock).mockResolvedValue(false);
    
        const response = await request(app).post('/admin/boundaries').send(newBoundary).set('userId', 'user');
    
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
    
    test('POST /admin/boundaries should handle errors gracefully', async () => {
        const newBoundary: BoundaryDto = { name: 'boundary1', description: 'desc1' };
        (boundaryRepo.insertBoundary as jest.Mock).mockRejectedValue(new Error('Database error'));
        (authorizationService.authorizeRole as jest.Mock).mockResolvedValue(true);
    
        const response = await request(app).post('/admin/boundaries').send(newBoundary).set('userId', 'admin');
    
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(logger.error).toHaveBeenCalledWith('Error adding a boundary: Database error');
    });
    
    test('PUT /admin/boundaries should update a boundary', async () => {
        const updateBoundary: BoundaryDto = { name: 'boundary1', description: 'desc1' };
        (boundaryRepo.updateBoundary as jest.Mock).mockResolvedValue(true);
        (authorizationService.authorizeRole as jest.Mock).mockResolvedValue(true);
    
        const response = await request(app).put('/admin/boundaries').send(updateBoundary).set('userId', 'admin');
    
        expect(response.status).toBe(HttpStatus.NO_CONTENT);
        expect(logger.log).toHaveBeenCalledWith(`updateBoundary called with boundary: ${updateBoundary.name}`);
    });
    
    test('PUT /admin/boundaries should return BAD_REQUEST if update fails', async () => {
        const updateBoundary: BoundaryDto = { name: 'boundary1', description: 'desc1' };
        (boundaryRepo.updateBoundary as jest.Mock).mockResolvedValue(false);
        (authorizationService.authorizeRole as jest.Mock).mockResolvedValue(true);
    
        const response = await request(app).put('/admin/boundaries').send(updateBoundary).set('userId', 'admin');
    
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(logger.log).toHaveBeenCalledWith(`updateBoundary called with boundary: ${updateBoundary.name}`);
    });
    
    test('PUT /admin/boundaries should return unauthorized if user is not admin', async () => {
        const updateBoundary: BoundaryDto = { name: 'boundary1', description: 'desc1' };
        (authorizationService.authorizeRole as jest.Mock).mockResolvedValue(false);
    
        const response = await request(app).put('/admin/boundaries').send(updateBoundary).set('userId', 'user');
    
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
    
    test('PUT /admin/boundaries should handle errors gracefully', async () => {
        const updateBoundary: BoundaryDto = { name: 'boundary1', description: 'desc1' };
        (boundaryRepo.updateBoundary as jest.Mock).mockRejectedValue(new Error('Database error'));
        (authorizationService.authorizeRole as jest.Mock).mockResolvedValue(true);
    
        const response = await request(app).put('/admin/boundaries').send(updateBoundary).set('userId', 'admin');
    
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(logger.error).toHaveBeenCalledWith('Error updating the boundary: Database error');
    });
    
    test('DELETE /admin/boundaries/:name should delete a boundary by name', async () => {
        (boundaryRepo.deleteBoundaryByName as jest.Mock).mockResolvedValue(true);
        (authorizationService.authorizeRole as jest.Mock).mockResolvedValue(true);
    
        const response = await request(app).delete('/admin/boundaries/boundary1').set('userId', 'admin');
    
        expect(response.status).toBe(HttpStatus.NO_CONTENT);
        expect(logger.log).toHaveBeenCalledWith('deleteBoundaryByName called with name: boundary1');
    });
    
    test('DELETE /admin/boundaries/:name should return BAD_REQUEST if deletion fails', async () => {
        (boundaryRepo.deleteBoundaryByName as jest.Mock).mockResolvedValue(false);
        (authorizationService.authorizeRole as jest.Mock).mockResolvedValue(true);
    
        const response = await request(app).delete('/admin/boundaries/boundary1').set('userId', 'admin');
    
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        expect(logger.log).toHaveBeenCalledWith('deleteBoundaryByName called with name: boundary1');
    });
    
    test('DELETE /admin/boundaries/:name should return unauthorized if user is not admin', async () => {
        (authorizationService.authorizeRole as jest.Mock).mockResolvedValue(false);
        (boundaryRepo.deleteBoundaryByName as jest.Mock).mockResolvedValue(false);
    
        const response = await request(app).delete('/admin/boundaries/boundary1').set('userId', 'user');
    
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

        
    test('DELETE /admin/boundaries/:name should handle errors gracefully', async () => {
        (boundaryRepo.deleteBoundaryByName as jest.Mock).mockRejectedValue(new Error('Database error'));
        (authorizationService.authorizeRole as jest.Mock).mockResolvedValue(true);
    
        const response = await request(app).delete('/admin/boundaries/boundary1').set('userId', 'admin');
    
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(logger.error).toHaveBeenCalledWith('Error deleting the boundary: Database error');
    });
    

});