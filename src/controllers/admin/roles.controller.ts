import * as express from 'express';
import { GET, route } from "awilix-express";
import { ILogger } from '../../services/ILogger';
import { RolesRepository } from '../../services/data/rolesrepository';

@route('/admin/roles')
export class RolesController {
    constructor(private readonly logger: ILogger,
        private readonly repo: RolesRepository) { }

    @GET()
    async getRoles(req: express.Request, res: express.Response) {
        this.logger.log('getRoles called;');
        const roles: ApiData.RoleDto[] = await this.repo.getAllRoles();
        res.status(200);
        res.json({ roles });
    }
}