import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import { getRepository, In } from 'typeorm';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

import UploadFiles from '../config/UploadFiles';

interface Request {
  filename: string;
}

interface TransactionData {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);

    const csvFilePath = path.join(UploadFiles.tmpDirectory, filename);
    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      // rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const categoriesLines: string[] = [];
    const transactionsLines: TransactionData[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categoriesLines.push(category);
      transactionsLines.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categoriesLines),
      },
    });

    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const nonExistentCategoriesToBeAdded = categoriesLines
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newAddedCategories = categoriesRepository.create(
      nonExistentCategoriesToBeAdded.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newAddedCategories);

    const finalCategories = [...newAddedCategories, ...existentCategories];

    const newAddedTransactions = transactionsRepository.create(
      transactionsLines.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(newAddedTransactions);

    await fs.promises.unlink(csvFilePath);

    return newAddedTransactions;
  }
}

export default ImportTransactionsService;
