import { getCustomRepository, getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import path from 'path';
import fs from 'fs';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface TransactionCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(file: string): Promise<Transaction[]> {
    // TODO

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const csvFilePath = path.join(uploadConfig.directory, file);
    console.log(csvFilePath);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactionsCSV: TransactionCSV[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      transactionsCSV.push({
        title: line[0],
        type: line[1],
        value: Number(line[2]),
        category: line[3],
      });

      categories.push(line[3]);
    });

    const categoriesRepository = getRepository(Category);

    await new Promise(resolve => parseCSV.on('end', resolve));

    const existsCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existsCategoriesTitle = existsCategories.map(
      (item: Category) => item.title,
    );

    const foundedNewCategories = categories
      .filter(item => !existsCategoriesTitle.includes(item))
      .filter((elem, index, arr) => arr.indexOf(elem) === index);

    const newCategories = categoriesRepository.create(
      foundedNewCategories.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const allCategories = [...newCategories, ...existsCategories];

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const createTransactions = transactionsRepository.create(
      transactionsCSV.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: allCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );
    /*

*/

    await transactionsRepository.save(createTransactions);

    await fs.promises.unlink(csvFilePath);

    return createTransactions;
  }
}

export default ImportTransactionsService;
