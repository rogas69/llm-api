/**
 * A simple class to store user entitlements
 */
export class EntitlementDTO {
    constructor(
        public readonly userid: string,
        public readonly roles: string[],
        public readonly boundaries: string[]
    ){}
}