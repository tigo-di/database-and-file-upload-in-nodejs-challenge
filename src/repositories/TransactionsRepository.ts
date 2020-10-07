import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  private transactions: Transaction[];

  private sum(type: string): number {
    return this.transactions.reduce(
      (acc, cur) => acc + Number(cur.type === type ? cur.value : 0),
      0,
    );
  }

  public async getBalance(): Promise<Balance> {
    // TODO
    this.transactions = await this.find();

    const sumIncome = this.sum('income');

    const sumOutcome = this.sum('outcome');

    const total = sumIncome - sumOutcome;

    const balance = { income: sumIncome, outcome: sumOutcome, total };

    return balance;
  }
}

export default TransactionsRepository;
