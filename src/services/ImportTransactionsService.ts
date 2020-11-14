import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import UploadFiles from '../config/UploadFiles';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  uploadFileName: string;
}

interface TransactionData {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
  category_id: string;
  created_at: Date;
  updated_at: Date;
  id: string;
}

class ImportTransactionsService {
  async execute({ uploadFileName }: Request): Promise<Transaction[]> {
    async function handleCSV(csvFilePath: string): Promise<Transaction[]> {
      const readCSVStream = fs.createReadStream(csvFilePath);

      const parseStream = csvParse({
        from_line: 2,
        ltrim: true,
        rtrim: true,
      });

      const parseCSV = readCSVStream.pipe(parseStream);

      const lines: [] = [];

      parseCSV.on('data', line => {
        return lines.push(line);
      });

      await new Promise(resolve => parseCSV.on('end', resolve));

      return lines;
    }

    const csvFilePath = path.join(UploadFiles.tmpDirectory, uploadFileName);

    const data = await handleCSV(csvFilePath);

    const createTransaction = new CreateTransactionService();
    const bulkTransacations: TransactionData[] = [
      {
        title: 'Ice cream',
        type: 'outcome',
        value: 3,
        category_id: '85f770ed-fef7-4bc9-9503-1de491d34cf6',
        id: 'cef23ab3-1b9d-487d-85cb-91d400130586',
        created_at: '2020-11-15T00:40:58.200Z',
        updated_at: '2020-11-15T00:40:58.200Z',
      },
    ];

    data.forEach(async item => {
      const title = item[0];
      const type = item[1];
      const value = item[2];
      const category = item[3];

      const trans = await createTransaction.execute({
        title,
        type,
        value,
        category,
      });

      console.log(trans);
      bulkTransacations.push(trans);
    });

    console.log();
    console.log(bulkTransacations);

    await fs.promises.unlink(csvFilePath);

    return bulkTransacations;

    /*     if (user.avatar) {
      const userAvatarFilePath = path.join(upload.directory,user.avatar);
      const userAvatarFileExists = await fs.promises.stat(userAvatarFilePath);

      if (userAvatarFileExists) {
        await fs.promises.unlink(userAvatarFilePath);
      }
    } */
  }
}

export default ImportTransactionsService;
