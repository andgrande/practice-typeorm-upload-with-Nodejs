// import AppError from '../errors/AppError';

import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

interface DeleteRequest {
  id: string;
}

/* interface ToDelete {
  transaction: Transaction;
} */

class DeleteTransactionService {
  public async execute({ id }: DeleteRequest): Promise<void> {
    const transactionsRepository = getRepository(Transaction);

    const transaction = await transactionsRepository.findOne(id);

    if (!transaction) {
      throw new AppError('Invalid ID');
    }

    await transactionsRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
