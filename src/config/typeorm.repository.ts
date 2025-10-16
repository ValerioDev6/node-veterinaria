import type { ObjectLiteral, Repository } from 'typeorm';
import { AppDataSource } from './data-source';

export const getRepositoryFactory = <T extends ObjectLiteral>(entity: new () => T): Repository<T> => {
  return AppDataSource.getRepository(entity);
};
