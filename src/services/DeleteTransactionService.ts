// import AppError from '../errors/AppError';
import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<boolean> {
    // TODO
    const transactionsRepository = getRepository(Transaction);

    const wasDeleted = await transactionsRepository.delete(id);

    return Boolean(wasDeleted.affected);
  }
}

export default DeleteTransactionService;
