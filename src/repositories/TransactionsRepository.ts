import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const queryResult = await this.find();

    const income = queryResult
      .filter(({ type }) => type === 'income')
      .reduce((acc, current) => {
        return acc + current.value;
      }, 0);

    const outcome = queryResult
      .filter(({ type }) => type === 'outcome')
      .reduce((acc, current) => {
        return acc + current.value;
      }, 0);

    const total = Math.round((income - outcome) * 100) / 100;

    const balance: Balance = {
      income,
      outcome,
      total,
    };

    return balance;
  }
}

export default TransactionsRepository;
