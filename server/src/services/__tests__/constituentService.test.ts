import { ConstituentService, ConstituentError } from '../constituentService';
import { Constituent } from '../../types/constituent';

export {};

describe('ConstituentService', () => {
  let service: ConstituentService;

  const mockConstituent: Omit<Constituent, 'id' | 'createdAt' | 'updatedAt'> = {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test St'
  };

  beforeEach(() => {
    ConstituentService.resetInstance();
    service = ConstituentService.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should create only one instance', () => {
      const instance1 = ConstituentService.getInstance();
      const instance2 = ConstituentService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should reset instance correctly', () => {
      const instance1 = ConstituentService.getInstance();
      ConstituentService.resetInstance();
      const instance2 = ConstituentService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Add Constituent', () => {
    it('should successfully add a new constituent', () => {
      const result = service.addConstituent(mockConstituent);

      expect(result).toMatchObject({
        ...mockConstituent,
        id: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    it('should throw error when email is missing', () => {
      const invalidConstituent = {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Test St'
      };

      expect(() => {
        service.addConstituent(invalidConstituent as any);
      }).toThrow(new ConstituentError('Email is required', 'MISSING_EMAIL'));
    });

    it('should update existing constituent when email exists', () => {
      const firstAdd = service.addConstituent(mockConstituent);
      
      const updatedConstituent = {
        ...mockConstituent,
        firstName: 'Jane',
        address: '456 New St'
      };

      const secondAdd = service.addConstituent(updatedConstituent);

      expect(secondAdd.id).toBe(firstAdd.id);
      expect(secondAdd.firstName).toBe('Jane');
      expect(secondAdd.address).toBe('456 New St');
    });
  });

  describe('Get All Constituents', () => {
    it('should return paginated results with default values', () => {
      const result = service.getAllConstituents();

      expect(result).toMatchObject({
        data: expect.any(Array),
        total: expect.any(Number),
        page: 1,
        pageSize: 10,
        totalPages: expect.any(Number)
      });
    });

    it('should return correct page size when specified', () => {
      const result = service.getAllConstituents(1, 5);
      expect(result.data.length).toBeLessThanOrEqual(5);
      expect(result.pageSize).toBe(5);
    });

    it('should throw error for invalid page number', () => {
      expect(() => {
        service.getAllConstituents(0, 5);
      }).toThrow(new ConstituentError('Page number must be greater than 0', 'INVALID_PAGE'));
    });

    it('should throw error for invalid page size', () => {
      expect(() => {
        service.getAllConstituents(1, 0);
      }).toThrow(new ConstituentError('Page size must be greater than 0', 'INVALID_PAGE_SIZE'));
    });
  });

  describe('Find By Email', () => {
    it('should find constituent by exact email match', () => {
      service.addConstituent(mockConstituent);
      const found = service.findByEmail('test@example.com');
      expect(found?.email).toBe(mockConstituent.email);
    });

    it('should find constituent by case-insensitive email', () => {
      service.addConstituent(mockConstituent);
      const found = service.findByEmail('TEST@EXAMPLE.COM');
      expect(found?.email).toBe(mockConstituent.email);
    });

    it('should return undefined for non-existent email', () => {
      const found = service.findByEmail('nonexistent@example.com');
      expect(found).toBeUndefined();
    });

    it('should return undefined for empty email', () => {
      const found = service.findByEmail('');
      expect(found).toBeUndefined();
    });
  });

  describe('Get Constituents By Date Range', () => {
    it('should return constituents within date range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const result = service.getConstituentsByDateRange({ startDate, endDate });
      expect(Array.isArray(result)).toBe(true);
    });

    it('should throw error for invalid date range', () => {
      const startDate = new Date('2024-12-31');
      const endDate = new Date('2024-01-01');

      expect(() => {
        service.getConstituentsByDateRange({ startDate, endDate });
      }).toThrow(new ConstituentError('Start date must be before end date', 'INVALID_DATE_RANGE'));
    });

    it('should throw error for invalid date format', () => {
      expect(() => {
        service.getConstituentsByDateRange({ 
          startDate: 'invalid' as any, 
          endDate: new Date() 
        });
      }).toThrow(new ConstituentError('Invalid date format', 'INVALID_DATE'));
    });
  });

  describe('Get Total Constituents', () => {
    it('should return correct total count', () => {
      service.addConstituent({
        email: 'test1@example.com',
        firstName: 'Test1',
        lastName: 'User1',
        address: 'Address1'
      });

      service.addConstituent({
        email: 'test2@example.com',
        firstName: 'Test2',
        lastName: 'User2',
        address: 'Address2'
      });

      const total = service.getTotalConstituents();
      expect(total).toBe(502);
    });
  });

  describe('Batch Upload', () => {
    it('should process batch upload successfully', async () => {
      const constituents: Array<Omit<Constituent, 'id' | 'createdAt' | 'updatedAt'>> = [
        {
          email: 'batch1@example.com',
          firstName: 'Batch1',
          lastName: 'User1',
          address: 'Address1'
        },
        {
          email: 'batch2@example.com',
          firstName: 'Batch2',
          lastName: 'User2',
          address: 'Address2'
        }
      ];

      const result = await service.processBatchUpload(constituents as Constituent[]);

      expect(result).toMatchObject({
        successful: 2,
        failed: 0,
        errors: [],
        totalProcessed: 2
      });
    });

    it('should handle errors in batch upload', async () => {
      const constituents = [
        {
          firstName: 'Invalid',
          lastName: 'User',
          address: 'Address'
        } as any,
        {
          email: 'valid@example.com',
          firstName: 'Valid',
          lastName: 'User',
          address: 'Address'
        }
      ];

      const result = await service.processBatchUpload(constituents);

      expect(result).toMatchObject({
        successful: 1,
        failed: 1,
        errors: [expect.objectContaining({
          row: 1,
          error: expect.any(String)
        })],
        totalProcessed: 2
      });
    });

    it('should throw error for invalid input', async () => {
      await expect(
        service.processBatchUpload('invalid' as any)
      ).rejects.toThrow(new ConstituentError('Invalid input: constituents must be an array', 'INVALID_INPUT'));
    });
  });
});