import express, { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express';
import { constituentService } from '../services/constituentService';
import { isAuthenticated } from '../middleware/auth'; 
import {processCSV} from '../utils/csvProcessor';
import { upload } from '../middleware/fileUpload';



const router = express.Router();

router.use(express.json());

router.use(isAuthenticated);

const getAllConstituents: RequestHandler = async (req, res, next) => {
  try {
    console.log("Fetching constituents with pagination");
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const constituents = constituentService.getAllConstituents(page, pageSize);
    res.json(constituents);
  } catch (error) {
    next(error);
  }
};

const addConstituent: RequestHandler = async (req, res, next) => {
  try {
    const constituent = constituentService.addConstituent(req.body);
    res.status(201).json(constituent);
  } catch (error) {
    next(error);
  }
};

const downloadCsv: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'startDate and endDate are required' });
  }

  try {
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const csvData = await constituentService.getConstituentsCsvByDateRange(start, end);

    res.header('Content-Type', 'text/csv');
    res.attachment('constituents.csv');
    res.send(csvData);
  } catch (error) {
    next(error);
  }
};

const batchUploadConstituents: RequestHandler<{}, any, any, any, { file: File }> = async (req: any, res: any, next: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const constituents = await processCSV(req.file.buffer);
    const result = await constituentService.processBatchUpload(constituents);

    res.json({
      message: 'File processed successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};



router.get('/', getAllConstituents);
router.post('/', addConstituent);
router.get('/download-csv', downloadCsv);
router.post('/batch-upload', upload.single('file'), batchUploadConstituents);
export { router as constituentRoutes };