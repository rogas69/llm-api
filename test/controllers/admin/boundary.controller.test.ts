import * as express from 'express';

import { HttpStatus } from 'http-status-ts';
import { ILogger } from '../../../src/services/ILogger';
import { BoundaryRepository } from '../../../src/services/data/boundary.repository';
import { BoundaryController } from '../../../src/controllers/admin/boundary.controller';

describe('BoundariesController Tests', () => {
    let logger: ILogger;
    let repo: BoundaryRepository;
    let repoNotFound: BoundaryRepository;
    let controller: BoundaryController;
    let controllerNotFound: BoundaryController;
    let req: express.Request;
    let res: express.Response;

    beforeEach(() => {
        logger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
        };

        repo = {
            getAllBoundaries: jest.fn().mockResolvedValue([{ name: 'admin', description: 'some description' }]),
            getBoundaryByName: jest.fn().mockResolvedValue([{ name: 'admin', description: 'some description' }]),
            insertBoundary: jest.fn().mockResolvedValue(undefined).mockReturnValue(true),
            updateBoundary: jest.fn().mockResolvedValue(true),
            deleteBoundaryByName: jest.fn()
                .mockResolvedValue(undefined)
                .mockReturnValue(true),
        } as unknown as BoundaryRepository;

        repoNotFound = {
            getAllBoundaries: jest.fn().mockResolvedValue([{ name: 'admin', description: 'some description' }]),
            getBoundaryByName: jest.fn().mockResolvedValue([]),
            insertBoundary: jest.fn().mockResolvedValue(undefined),
            updateBoundary: jest.fn().mockResolvedValue(true),
            deleteBoundaryByName: jest.fn()
                .mockResolvedValue(undefined)
                .mockReturnValue(false),
        } as unknown as BoundaryRepository;

        controller = new BoundaryController(logger, repo);

        //used for not found scenarios in the database
        controllerNotFound = new BoundaryController(logger, repoNotFound);

        req = {
            params: {},
            body: {},
        } as unknown as express.Request;

        res = {
            status: jest.fn()
            .mockResolvedValue(undefined)
            .mockReturnThis(),
            send: jest.fn().mockResolvedValue(undefined),
            json: jest.fn().mockReturnThis(),
        } as unknown as express.Response;
    });

    it('should get all boundaries', async () => {
        await controller.getAllBoundaries(req, res);

        expect(logger.log).toHaveBeenCalledWith('getAllBoundaries called;');
        expect(repo.getAllBoundaries).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
        expect(res.json).toHaveBeenCalledWith({ boundaries: [{ name: 'admin', description: 'some description' }] });
    });

    it('should get boundary by name', async () => {
        req.params.name = 'admin';

        await controller.getBoundaryByName(req, res);

        expect(logger.log).toHaveBeenCalledWith('getBoundaryByName called with name: admin');
        expect(repo.getBoundaryByName).toHaveBeenCalledWith('admin');
        expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
        expect(res.json).toHaveBeenCalledWith({ boundaries: [{ name: 'admin', description: 'some description' }] });
    });

    it('should add a boundary', async () => {
        req.body = { name: 'admin', description: 'some description' };
        req.params.name = 'admin';
        await controller.addBoundary(req, res);

        expect(logger.log).toHaveBeenCalledWith('addBoundary called with boundary: admin');
        expect(repo.insertBoundary).toHaveBeenCalledWith({ name: 'admin', description: 'some description' });
        expect(res.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
    });

    it('should update a boundary', async () => {
        req.body = { name: 'admin', description: 'updated description' };

        await controller.updateBoundary(req, res);

        expect(logger.log).toHaveBeenCalledWith('updateBoundary called with boundary: admin');
        expect(repo.updateBoundary).toHaveBeenCalledWith({ name: 'admin', description: 'updated description' });
        expect(res.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
    });

    it('should delete boundary by name', async () => {
        req.params.name = 'admin';

        await controller.deleteBoundaryByName(req, res);

        expect(logger.log).toHaveBeenCalledWith('deleteBoundaryByName called with name: admin');
        expect(repo.deleteBoundaryByName).toHaveBeenCalledWith('admin');
        expect(repo.deleteBoundaryByName).toHaveReturnedWith(true);
        expect(res.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
    });

    it('should return error when deleting boundary with invalid name', async () => {
        req.params.name = 'invalidboundary';

        await controllerNotFound.deleteBoundaryByName(req, res);

        expect(logger.log).toHaveBeenCalledWith('deleteBoundaryByName called with name: invalidboundary');
        expect(repoNotFound.deleteBoundaryByName).toHaveBeenCalledWith('invalidboundary');
        expect(repoNotFound.deleteBoundaryByName).toHaveReturnedWith(false);
        expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should return error when getting boundary with invalid name', async () => {
        req.params.name = 'invalidboundary';

        await controllerNotFound.getBoundaryByName(req, res);

        expect(logger.log).toHaveBeenCalledWith('getBoundaryByName called with name: invalidboundary');
        expect(repoNotFound.getBoundaryByName).toHaveBeenCalledWith('invalidboundary');
        expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
        expect(res.json).toHaveBeenCalledWith({ boundaries: [] });
    });

    it('should return error when adding boundary with invalid data', async () => {
        req.body = { name: '', description: '' };
        repo.insertBoundary = jest.fn().mockResolvedValue({ name: '', description: '' }).mockReturnValue(false),
        await controller.addBoundary(req, res);

        expect(logger.log).toHaveBeenCalledWith('addBoundary called with boundary: ');
        expect(repo.insertBoundary).toHaveBeenCalledWith({ name: '', description: '' });
        expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should return error when updating boundary with invalid data', async () => {
        req.body = { name: '', description: '' };
        repo.updateBoundary = jest.fn().mockResolvedValue({ name: '', description: '' }).mockReturnValue(false),
        await controller.updateBoundary(req, res);

        expect(logger.log).toHaveBeenCalledWith('updateBoundary called with boundary: ');
        expect(repo.updateBoundary).toHaveBeenCalledWith({ name: '', description: '' });
        expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should return error when deleting boundary with invalid name', async () => {
        req.params.name = '';
        repo.deleteBoundaryByName = jest.fn().mockResolvedValue('').mockReturnValue(false),
        await controller.deleteBoundaryByName(req, res);
        //expect(logger.warn).toHaveBeenCalledWith('Error deleting boundary - invalid name passed.');
        expect(logger.log).toHaveBeenCalledWith('deleteBoundaryByName called with name: ');
        expect(repo.deleteBoundaryByName).toHaveBeenCalledWith('');
        expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

});