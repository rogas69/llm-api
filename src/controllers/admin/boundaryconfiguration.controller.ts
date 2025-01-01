import * as express from 'express';
import { DELETE, GET, POST, PUT, route } from "awilix-express";
import { ILogger } from '../../services/ILogger';
import { BoundaryConfigurationRepository } from '../../services/data/boundaryconfigurationrepository';
import { BoundaryConfigurationDto } from '../../services/data/boundaryconfigurationdto';
import { HttpStatus } from 'http-status-ts';

/**
 * Controller used to configure deaults like models to use, perhaps prompt templates etc.
 */
@route('/admin/boundaryconfigurations')
export class BoundaryConfigurationController {

    constructor(
        private readonly logger: ILogger,
        private readonly boundaryConfigurationRepo: BoundaryConfigurationRepository) { }

    @GET()
    async getAllBoundaryConfigurations(req: express.Request, res: express.Response) {
        this.logger.log('getBoundaryConfigurations called;');
        const boundaryName = req.query.boundaryName as string;
        const modelProvider = req.query.modelProvider as string;
        const configurations: BoundaryConfigurationDto[] = await this.boundaryConfigurationRepo.getBoundaryConfigurations({ boundaryName, modelProvider });
        res.status(HttpStatus.OK)
            .json({ configurations: configurations });
    }

    @POST()
    async addBoundaryConfiguration(req: express.Request, res: express.Response) {
        this.logger.log('addBoundaryConfiguration called');
        const boundaryConfiguration: BoundaryConfigurationDto = req.body;
        const result = await this.boundaryConfigurationRepo.insertBoundaryConfiguration(boundaryConfiguration);
        res.status(result ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST).send();
    }

    @PUT()
    async updateBoundaryConfiguration(req: express.Request, res: express.Response) {
        this.logger.log('updateBoundaryConfiguration called');
        const boundaryConfiguration: BoundaryConfigurationDto = req.body;
        const result = await this.boundaryConfigurationRepo.updateBoundaryConfiguration(boundaryConfiguration);
        res.status(result ? HttpStatus.OK : HttpStatus.BAD_REQUEST).send();
    }

    @route('/:name')
    @DELETE()
    async deleteBoundaryConfiguration(req: express.Request, res: express.Response) {
        this.logger.log('deleteBoundaryConfiguration called');
        const boundaryName = req.params.name;
        const result = await this.boundaryConfigurationRepo.deleteBoundaryConfigurationByBoundaryName(boundaryName);
        res.status(result ? HttpStatus.OK : HttpStatus.BAD_REQUEST).send();
    }

}