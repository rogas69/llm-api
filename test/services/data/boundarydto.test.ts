import { BoundaryDto } from '../../../src/services/data/boundarydto';

describe('BoundaryDto Tests', () => {
    it('should create a BoundaryDto instance with valid data', () => {
        const name = 'Test Boundary';
        const description = 'This is a test boundary';
        const boundaryDto = new BoundaryDto(name, description);

        expect(boundaryDto).toBeInstanceOf(BoundaryDto);
        expect(boundaryDto.name).toBe(name);
        expect(boundaryDto.description).toBe(description);
    });
});