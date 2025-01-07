import * as express from 'express';
import { BoundaryRepository } from "./data/boundary.repository";
import { EntitlementRepository } from "./data/entitlements.repository";
import { ILogger } from "./ILogger";

/**
 * The service contains logic that is responsible for handling authorization to the API endpoints.
 * It probably should be plugged in into the middleware stack
 */
export class AuthorizationService {
    constructor(
        private readonly logger: ILogger,
        private readonly entitlementRepo: EntitlementRepository,
        private readonly requiredRoles: string[],
        private readonly requiredBoundaries: string[]) { }

    private async existsinTable(value: string, table: string[], predicate: (searchValue: string, item: string) => Promise<boolean>): Promise<boolean> {
        for (const item of table) {
            if (await predicate(value, item)) {
                return true;
            }
        }
        return false;
    }

    public async authorizeRole(req: express.Request, res: express.Response): Promise<boolean> {
        try {
            const user = req.header('userId') ?? "";

            this.logger.log(`authorizeRole called with user: ${user}`);

            const anyRole = await this.existsinTable(user, this.requiredRoles, this.entitlementRepo.isInRole);
            if (!anyRole) {
                this.logger.warn(`authorizeRole failed for user: ${user}`);
                return false;
            }
            return true;
        } catch (error) {
            const err = error as Error;
            this.logger.error(`authorizeRole failed: ${err.message}`);
            return false;
        }
    }

    public async authorizeBoundary(req: express.Request, res: express.Response): Promise<boolean> {
        try {
            const user = req.header('userId') ?? "";
            this.logger.log(`authorizeBoundary called with user: ${user}`);

            const anyBoundary = await this.existsinTable(user, this.requiredBoundaries, this.entitlementRepo.isInBoundary);
            if (!anyBoundary) {
                this.logger.warn(`authorizeBoundary failed for user: ${user}`);
                return false;
            }
            return true;
        } catch (error) {
            const err = error as Error;
            this.logger.error(`authorizeBoundary failed: ${err.message}`);
            return false;
        }
    }
}