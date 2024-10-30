import { parse } from 'csv-parse';
import { Readable } from 'stream';
import { z } from 'zod';

const csvConstituentSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address: z.string().min(1),
});

export async function processCSV(fileBuffer: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const constituents: any[] = [];
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const stream = Readable.from(fileBuffer);

    stream
      .pipe(parser)
      .on('data', (row) => {
        try {
          const normalizedRow = {
            email: row.email || row.Email || row.EMAIL,
            firstName: row.firstName || row.FirstName || row['First Name'] || row.FIRSTNAME,
            lastName: row.lastName || row.LastName || row['Last Name'] || row.LASTNAME,
            address: row.address || row.Address || row.ADDRESS,
          };

          csvConstituentSchema.parse(normalizedRow);
          constituents.push(normalizedRow);
        } catch (error) {
          console.error('Invalid row:', row, error);
        }
      })
      .on('end', () => resolve(constituents))
      .on('error', reject);
  });
}