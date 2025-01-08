import * as express from 'express';
import { before, DELETE, GET, POST, PUT, route } from "awilix-express";
import { ILogger } from '../../services/ILogger';
import { BoundaryRepository } from '../../services/data/boundary.repository';
import { HttpStatus } from 'http-status-ts';
import { BoundaryDto } from '../../services/data/boundarydto';
import { AuthorizationService } from '../../services/authorization.service';


/**
 * Controller used to administer boundaries (CRUD)
 */
@route('/admin/boundaries')
export class BoundaryController {
    constructor(
        private readonly logger: ILogger,
        private readonly boundaryRepo: BoundaryRepository,
        private readonly authorizationService: AuthorizationService) { }


    private async authorize(req: express.Request, res: express.Response): Promise<boolean> {
        if (!await this.authorizationService.authorizeRole(req, res)) {
            res.status(HttpStatus.UNAUTHORIZED).send();
            return false;
        }
        return true;
    }


    @GET()
    async getAllBoundaries(req: express.Request, res: express.Response) {
        try {
            if (!await this.authorize(req, res)) 
                return;

            this.logger.log('getAllBoundaries called;');
            console.log('getAllBoundaries called;  userid: ' + (req as any).currentUser);

            const boundaries: BoundaryDto[] = await this.boundaryRepo.getAllBoundaries();
            res.status(HttpStatus.OK)
                .json({ boundaries: boundaries });
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error getting boundaries: ${err.message}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ "error": "An error occurred while getting boundaries" });
        }
    }

    //this might a code smell, but we don't need an if in the getAllBoundaries method that checks if the name is present in the query string
    @route('/:name')
    @GET()
    async getBoundaryByName(req: express.Request, res: express.Response) {
        try {
            if (!await this.authorize(req, res)) 
                return;
            const name = req.params.name;
            this.logger.log(`getBoundaryByName called with name: ${name}`);
            const boundaries: BoundaryDto[] = await this.boundaryRepo.getBoundaryByName(name);
            res.status(HttpStatus.OK).json({ boundaries: boundaries });
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error getting boundary by name: ${err.message}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ "error": "Error getting boundary by name" });
        }
    }


    @POST()
    async addBoundary(req: express.Request, res: express.Response) {
        try {
            if (!await this.authorize(req, res)) 
                return;
            const newBoundary = req.body as unknown as BoundaryDto;
            this.logger.log(`addBoundary called with boundary: ${newBoundary.name}`);
            res.status(await this.boundaryRepo.insertBoundary(newBoundary) ? HttpStatus.NO_CONTENT : HttpStatus.BAD_REQUEST)
                .send();
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error adding a boundary: ${err.message}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ "error": "Error adding a boundary" });
        }
    }


    @PUT()
    async updateBoundary(req: express.Request, res: express.Response) {
        try {
            if (!await this.authorize(req, res)) 
                return;
            const updateBoundary = req.body as unknown as BoundaryDto;
            this.logger.log(`updateBoundary called with boundary: ${updateBoundary.name}`);
    
            res.status(await this.boundaryRepo.updateBoundary(updateBoundary) ? HttpStatus.NO_CONTENT : HttpStatus.BAD_REQUEST)
                .send();
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error updating the boundary: ${err.message}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ "error": "Error updating the boundary" });
        }
    }


    @route('/:name')
    @DELETE()
    async deleteBoundaryByName(req: express.Request, res: express.Response) {
        try {
            if (!await this.authorize(req, res)) 
                return;
            const name = req.params.name;
            this.logger.log(`deleteBoundaryByName called with name: ${name}`);
    
            res.status(await this.boundaryRepo.deleteBoundaryByName(name) ? HttpStatus.NO_CONTENT : HttpStatus.BAD_REQUEST)
                .send();
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error deleting the boundary: ${err.message}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ "error": "Error deleting the boundary" });
        }
    }
}