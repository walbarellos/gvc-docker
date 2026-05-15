import { Visitor } from '../entities/Visitor.js';

export interface IVisitorRepository {
  findAll(filters: { cpf?: string; passport?: string; order?: 'asc' | 'desc' }): Promise<Visitor[]>;
  findById(id: string): Promise<Visitor | null>;
  findByCpf(cpf: string): Promise<Visitor | null>;
  save(visitor: Visitor): Promise<Visitor>;
  delete(id: string): Promise<void>;
}
