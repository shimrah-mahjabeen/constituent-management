import { Constituent, BatchUploadResult , PaginatedResult,DateRangeParams } from '../types/constituent';
import { v4 as uuidv4 } from 'uuid';
import { Parser } from 'json2csv';

export class ConstituentError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ConstituentError';
  }
}
export class ConstituentService {
  private static instance: ConstituentService | null = null;
  private readonly constituents: Map<string, Constituent>;
  private readonly INITIAL_CONSTITUENTS_COUNT = 500;

  private constructor() {
    this.constituents = new Map();
    this.addInitialConstituents();
  }

  public static getInstance(): ConstituentService {
    if (!ConstituentService.instance) {
      ConstituentService.instance = new ConstituentService();
    }
    return ConstituentService.instance;
  }

  private addInitialConstituents(): void {
    const batch = Array.from({ length: this.INITIAL_CONSTITUENTS_COUNT }, (_, i) => ({
      email: `constituent${i}@example.com`,
      firstName: `First${i}`,
      lastName: `Last${i}`,
      address: `${i} Main St`,
    }));

    batch.forEach(constituent => {
      this.addConstituent(constituent);
    });
  }

  public getTotalConstituents(): number {
    return this.constituents.size;
  }

  public getAllConstituents(page: number = 1, pageSize: number = 10): PaginatedResult<Constituent> {
    if (page < 1) throw new ConstituentError('Page number must be greater than 0', 'INVALID_PAGE');
    if (pageSize < 1) throw new ConstituentError('Page size must be greater than 0', 'INVALID_PAGE_SIZE');

    const allConstituents = Array.from(this.constituents.values());
    const total = allConstituents.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    
    const paginatedConstituents = allConstituents.slice(offset, offset + pageSize);

    return {
      data: paginatedConstituents,
      total,
      page,
      pageSize,
      totalPages
    };
  }

public addConstituent(data: Omit<Constituent, 'id' | 'createdAt' | 'updatedAt'>): Constituent {
    if (!data.email) {
        throw new ConstituentError('Email is required', 'MISSING_EMAIL');
    }

    const timestamp = new Date();
    const existingConstituent = this.findByEmail(data.email);

    if (existingConstituent) {
        const merged = {
            ...existingConstituent, 
            ...data,
            updatedAt: timestamp,
            createdAt: existingConstituent.createdAt
        };

        this.constituents.set(existingConstituent.id, merged);
        return merged;
    }

    const newConstituent: Constituent = {
        id: uuidv4(),
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp
    };

    this.constituents.set(newConstituent.id, newConstituent);
    return newConstituent;
}

  public async processBatchUpload(constituents: Constituent[]): Promise<BatchUploadResult> {
    if (!Array.isArray(constituents)) {
      throw new ConstituentError('Invalid input: constituents must be an array', 'INVALID_INPUT');
    }

    const result: BatchUploadResult = {
      successful: 0,
      failed: 0,
      errors: [],
      totalProcessed: constituents.length
    };

    const BATCH_SIZE = 100;
    for (let i = 0; i < constituents.length; i += BATCH_SIZE) {
      const batch = constituents.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async (constituent, index) => {
        try {
          await this.addConstituent(constituent);
          result.successful++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            row: i + index + 1,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: constituent
          });
        }
      }));
    }

    return result;
  }

  public findByEmail(email: string): Constituent | undefined {
    if (!email) return undefined;
    
    const normalizedEmail = email.toLowerCase().trim();
    for (const constituent of this.constituents.values()) {
      if (constituent.email.toLowerCase() === normalizedEmail) {
        return constituent;
      }
    }
    return undefined;
  }

    public getConstituentsByDateRange({ startDate, endDate }: DateRangeParams): Constituent[] {
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      throw new ConstituentError('Invalid date format', 'INVALID_DATE');
    }

    if (startDate > endDate) {
      throw new ConstituentError('Start date must be before end date', 'INVALID_DATE_RANGE');
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    console.log('Searching for constituents between:', {
      start: start.toISOString(),
      end: end.toISOString(),
      totalConstituents: this.constituents.size
    });

    const results = Array.from(this.constituents.values()).filter((constituent) => {
      const constituentDate = new Date(constituent.createdAt);
      const isInRange = constituentDate >= start && constituentDate <= end;
      
      if (isInRange) {
        console.log('Found matching constituent:', {
          id: constituent.id,
          createdAt: constituentDate.toISOString(),
        });
      }
      
      return isInRange;
    });

    console.log('Found total results:', results.length);
    return results;
  }

  public async getConstituentsCsvByDateRange(startDate: Date, endDate: Date): Promise<string> {
    const constituentsInRange = this.getConstituentsByDateRange({ startDate, endDate });
    
    if (constituentsInRange.length === 0) {
      console.log('No constituents found in range:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalConstituents: this.constituents.size
      });
      throw new ConstituentError('No constituents found in the specified date range', 'NO_DATA_FOUND');
    }

    try {
      const fields = ['id', 'email', 'firstName', 'lastName', 'address', 'createdAt', 'updatedAt'];
      const json2csvParser = new Parser({ fields });
      return json2csvParser.parse(constituentsInRange);
    } catch (error) {
      console.error('CSV generation error:', error);
      throw new ConstituentError('Failed to generate CSV', 'CSV_GENERATION_ERROR');
    }
  }

  public static resetInstance(): void {
    ConstituentService.instance = null;
  }
}

export const constituentService = ConstituentService.getInstance();