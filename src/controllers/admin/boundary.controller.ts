import * as express from 'express';
import { DELETE, GET, POST, PUT, route } from "awilix-express";
import { ILogger } from '../../services/ILogger';
import { BoundaryRepository } from '../../services/data/boundary.repository';
import { HttpStatus } from 'http-status-ts';
import { BoundaryDto } from '../../services/data/boundarydto';


/**
 * Controller used to administer boundaries (CRUD)
 */
@route('/admin/boundaries')
export class BoundaryController {
    constructor(
        private readonly logger: ILogger,
        private readonly boundaryRepo: BoundaryRepository) { }

    @GET()
    async getAllBoundaries(req: express.Request, res: express.Response) {
        this.logger.log('getAllBoundaries called;');
        const boundaries: BoundaryDto[] = await this.boundaryRepo.getAllBoundaries();
        res.status(HttpStatus.OK)
            .json({ boundaries: boundaries });
    }

    //this might a code smell, but we don't need an if in the getAllBoundaries method that checks if the name is present in the query string
    @route('/:name') 
    @GET()
    async getBoundaryByName(req: express.Request, res: express.Response) {
        const name = req.params.name;
        this.logger.log(`getBoundaryByName called with name: ${name}`);
        const boundaries: BoundaryDto[] = await this.boundaryRepo.getBoundaryByName(name);
        res.status(HttpStatus.OK).json({ boundaries: boundaries });
    }


    @POST()
    async addBoundary(req: express.Request, res: express.Response) {
        const newBoundary = req.body as unknown as BoundaryDto;
        this.logger.log(`addBoundary called with boundary: ${newBoundary.name}`);
        res.status(await this.boundaryRepo.insertBoundary(newBoundary) ? HttpStatus.NO_CONTENT : HttpStatus.BAD_REQUEST)
           .send();
    }


    @PUT()
    async updateBoundary(req: express.Request, res: express.Response) {
        const updateBoundary = req.body as unknown as BoundaryDto;
        this.logger.log(`updateBoundary called with boundary: ${updateBoundary.name}`);

        res.status(await this.boundaryRepo.updateBoundary(updateBoundary) ? HttpStatus.NO_CONTENT : HttpStatus.BAD_REQUEST)
           .send();
    }


    @route('/:name')
    @DELETE()
    async deleteBoundaryByName(req: express.Request, res: express.Response) {
        const name = req.params.name;
        this.logger.log(`deleteBoundaryByName called with name: ${name}`);
        
        res.status(await this.boundaryRepo.deleteBoundaryByName(name) ? HttpStatus.NO_CONTENT : HttpStatus.BAD_REQUEST)
           .send();
    }
}