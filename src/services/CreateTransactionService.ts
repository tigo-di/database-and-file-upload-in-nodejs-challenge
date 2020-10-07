import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface Response {
  existsCategory: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome') {
      const withoutBalance = total < value;

      if (withoutBalance) {
        throw new AppError('Without enough balance');
      }
    }
    const categoriesRepository = getRepository(Category);

    let transactionCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!transactionCategory) {
      transactionCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(transactionCategory);
    }

    const dataNewTransaction = {
      title,
      value,
      type,
      category: transactionCategory,
    };

    const newTransaction = transactionsRepository.create(dataNewTransaction);

    await transactionsRepository.save(newTransaction);

    return newTransaction;
  }
}

export default CreateTransactionService;
