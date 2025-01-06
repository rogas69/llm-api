import { DBContext } from "../../database/dbcontext";
import { ILogger } from "../ILogger";
import { EntitlementDTO } from "./entitlementdto";

/**
 * Entitlement Repository to manage and check entitlements of users.
 */
export class EntitlementRepository {
    
    constructor(
        private readonly dbContext: DBContext
    ) { }

    /**
     * Check if a user is in a role.
     * @param userId - the user id to check
     * @returns true if the user is in the role, false otherwise
     */
    isInRole(userId: string, role: string): Promise<boolean> {
        return this.dbContext
            .connectDatabase()
            .then(async db => {
                const entitlement: EntitlementDTO | null = await db.collection<EntitlementDTO>('entitlements')
                    .findOne({ userid: userId });
                return entitlement?.roles.includes(role) ?? false;
            });
    }

    /**
     * Check if a user is in a boundary.
     * @param userId - the user id to check
     * @returns true if the user is in the boundary, false otherwise
     */
    isInBoundary(userId: string, boundary: string): Promise<boolean> {
        return this.dbContext
            .connectDatabase()
            .then(async db => {
                const entitlement: EntitlementDTO | null = await db.collection<EntitlementDTO>('entitlements')
                    .findOne({ userid: userId });
                return entitlement?.boundaries.includes(boundary) ?? false;
            });

    }

    async insertEntitlement(entitlement: EntitlementDTO): Promise<boolean> {
        const result = await this.dbContext.connectDatabase()
            .then(async db => { return await db.collection<EntitlementDTO>('entitlements').insertOne(entitlement) });
        return result.acknowledged;
    }
}