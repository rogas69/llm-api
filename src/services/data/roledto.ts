namespace ApiData {
    /**
     * Used to transfer data from the database to the client
     */
    export class RoleDto {
        constructor(
            public readonly id: string,
            public readonly name: string,
            public readonly description: string
        ) { }
    }
}