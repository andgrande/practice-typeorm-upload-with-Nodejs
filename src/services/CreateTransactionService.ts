// import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

interface TransactionData {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: TransactionData): Promise<Transaction> {
    if (value < 1) {
      throw new AppError('Invalid operation value');
    }
    if (type === 'outcome') {
      const balanceRepository = getCustomRepository(TransactionRepository);
      const { total } = await balanceRepository.getBalance();

      if (total - value < 0) {
        throw new AppError(
          `Currently it is not possible to withdraw more than $${total}`,
        );
      }
    }

    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);

    const isCategoryExistent = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!isCategoryExistent) {
      const categoryData = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryData);
    }

    const [{ id }] = await categoryRepository.find({
      select: ['id'],
      where: { title: category },
    });

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: id,
    });

    await transactionRepository.save(transaction);

    return transaction || null;
  }
}

export default CreateTransactionService;
