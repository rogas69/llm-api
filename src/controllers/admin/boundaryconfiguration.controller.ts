import * as express from 'express';
import { DELETE, GET, POST, PUT, route } from "awilix-express";
import { ILogger } from '../../services/ILogger';
import { BoundaryConfigurationRepository } from '../../services/data/boundaryconfiguration.repository';
import { BoundaryConfigurationDto } from '../../services/data/boundaryconfigurationdto';
import { HttpStatus } from 'http-status-ts';
import { AuthorizationService } from '../../services/authorization.service';

/**
 * Controller used to configure boundary defaults like models to use, perhaps prompt templates etc.
 */
@route('/admin/boundaryconfigurations')
export class BoundaryConfigurationController {

    constructor(
        private readonly logger: ILogger,
        private readonly boundaryConfigurationRepo: BoundaryConfigurationRepository,
        private readonly authorizationService: AuthorizationService) { }


    private async authorize(req: express.Request, res: express.Response): Promise<boolean> {
        if (!await this.authorizationService.authorizeRole(req, res)) {
            res.status(HttpStatus.UNAUTHORIZED).send();
            return false;
        }
        return true;
    }


    @GET()
    async getAllBoundaryConfigurations(req: express.Request, res: express.Response) {
        if (!await this.authorize(req, res))
            return;
        this.logger.log('getBoundaryConfigurations called;');
        const boundaryName = req.query.boundaryName as string;
        const modelProvider = req.query.modelProvider as string;
        const configurations: BoundaryConfigurationDto[] = await this.boundaryConfigurationRepo.getBoundaryConfigurations({ boundaryName, modelProvider });
        res.status(HttpStatus.OK)
            .json({ configurations: configurations });
    }

    @POST()
    async addBoundaryConfiguration(req: express.Request, res: express.Response) {
        if (!await this.authorize(req, res))
            return;
        this.logger.log('addBoundaryConfiguration called');
        const boundaryConfiguration: BoundaryConfigurationDto = req.body;
        const result = await this.boundaryConfigurationRepo.insertBoundaryConfiguration(boundaryConfiguration);
        res.status(result ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST).send();
    }

    @PUT()
    async updateBoundaryConfiguration(req: express.Request, res: express.Response) {
        if (!await this.authorize(req, res))
            return;
        this.logger.log('updateBoundaryConfiguration called');
        const boundaryConfiguration: BoundaryConfigurationDto = req.body;
        const result = await this.boundaryConfigurationRepo.updateBoundaryConfiguration(boundaryConfiguration);
        res.status(result ? HttpStatus.OK : HttpStatus.BAD_REQUEST).send();
    }

    @route('/:name')
    @DELETE()
    async deleteBoundaryConfiguration(req: express.Request, res: express.Response) {
        if (!await this.authorize(req, res))
            return;
        this.logger.log('deleteBoundaryConfiguration called');
        const boundaryName = req.params.name;
        const result = await this.boundaryConfigurationRepo.deleteBoundaryConfigurationByBoundaryName(boundaryName);
        res.status(result ? HttpStatus.OK : HttpStatus.BAD_REQUEST).send();
    }

}