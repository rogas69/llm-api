/**
 * Used to transfer data from the database to the client. 
 */
export class BoundaryDto {
    constructor(
        public readonly name: string,
        public readonly description: string
    ) { }
}