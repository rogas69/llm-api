import { ObjectId } from "mongodb";
import { DBContext } from "../../database/dbcontext";

export class RolesRepository implements Disposable {
    constructor(private readonly dbContext: DBContext) { }
    
    async getAllRoles(): Promise<ApiData.RoleDto[]> {
        const db = await this.dbContext.connectDatabase();
        const roles = await db.collection<ApiData.RoleDto>('roles').find().toArray();
        return roles;
    }


    async getRoleByName(name: string): Promise<ApiData.RoleDto[]> {
        const db = await this.dbContext.connectDatabase();
        const role = await db.collection<ApiData.RoleDto>('roles').find({ name: name }).toArray();
        return role;
    }

    async insertRole(role: ApiData.RoleDto): Promise<void> {
        const db = await this.dbContext.connectDatabase();
        await db.collection<ApiData.RoleDto>('roles').insertOne(role);
    }

    async deleteRoleByName(roleName: string): Promise<void> {
        const db = await this.dbContext.connectDatabase();
        await db.collection<ApiData.RoleDto>('roles').deleteOne({ name: roleName });
    }

    [Symbol.dispose](): void {
        this.dbContext[Symbol.dispose]();
    }
    
}