import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import UploadFiles from '../config/UploadFiles';
import AppError from '../errors/AppError';

const upload = multer(UploadFiles);
const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find();

  const balance = await transactionRepository.getBalance();

  return response.status(200).json({ transactions, balance });
});

transactionsRouter.get('/balance', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const balance = await transactionRepository.getBalance();

  return response.status(200).json({ balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  if (title === '' || value === 0 || type === '' || category === '') {
    console.log('Missing parameters');
    throw new AppError('Missing parameters');
  }

  const createTransaction = new CreateTransactionService();

  const { id } = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.status(200).json({ id });
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const transactionDelete = new DeleteTransactionService();

  await transactionDelete.execute({
    id,
  });

  return response.status(204).json();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();

    console.log('Z');
    const transactions = await importTransactionsService.execute({
      filename: request.file.filename,
    });

    return response.json(transactions);
  },
);

export default transactionsRouter;
