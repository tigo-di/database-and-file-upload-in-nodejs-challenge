import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import Transaction from '../models/Transaction';

const upload = multer(uploadConfig);
const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  // TODO
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find({
    relations: ['category_id'],
  });

  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  // TODO

  try {
    const { title, value, type, category } = request.body;

    const newTransaction = { title, value, type, category };

    const createTransactionService = new CreateTransactionService();

    const transaction = await createTransactionService.execute(newTransaction);
    return response.status(200).json(transaction);
  } catch (err) {
    return response.status(400).json({ message: err.message, status: 'error' });
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO

  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();

  const wasTheTransactionDeleted = await deleteTransaction.execute({ id });

  if (wasTheTransactionDeleted) {
    return response.status(204).send();
  }

  return response.status(400).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    // TODO
    const importTransactions = new ImportTransactionsService();

    const wasImported = await importTransactions.execute(request.file.filename);

    return response.status(200).json(wasImported);
  },
);

export default transactionsRouter;
