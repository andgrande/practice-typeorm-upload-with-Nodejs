import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import UploadFiles from '../config/UploadFiles';

const upload = multer(UploadFiles);
const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  // TODO
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find();

  const balance = await transactionRepository.getBalance();

  return response.status(200).json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

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
  upload.single('transactionsFile'),
  async (request, response) => {
    // TODO
    /*     const importTransactionsService = new ImportTransactionsService();

    const transactions = await importTransactionsService.execute({
      uploadFileName: request.file.filename,
    });

    return response.json(transactions); */
  },
);

export default transactionsRouter;
