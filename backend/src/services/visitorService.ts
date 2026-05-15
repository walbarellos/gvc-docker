import { Visitor } from '../domain/entities/Visitor.js';
import { IVisitorRepository } from '../domain/repositories/IVisitorRepository.js';

export class VisitorService {
  constructor(private visitorRepository: IVisitorRepository) {}

  async listVisitors(filters: { cpf?: string; passport?: string; order?: 'asc' | 'desc' }): Promise<Visitor[]> {
    return this.visitorRepository.findAll(filters);
  }

  async getVisitorById(id: string): Promise<Visitor | null> {
    return this.visitorRepository.findById(id);
  }

  async getVisitorByCpf(cpf: string): Promise<Visitor | null> {
    return this.visitorRepository.findByCpf(cpf);
  }

  async createVisitor(data: any): Promise<Visitor> {
    // Aqui poderíamos usar um Factory ou o próprio construtor da Entidade
    const visitor = new Visitor({
      id: crypto.randomUUID(),
      fullName: data.fullName || data.full_name,
      cpf: data.cpf,
      isForeigner: data.is_foreigner || data.isForeigner || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      // ... outros campos mapeados
    } as any);

    return this.visitorRepository.save(visitor);
  }

  async updateVisitor(id: string, data: any): Promise<Visitor> {
    const existing = await this.visitorRepository.findById(id);
    if (!existing) throw new Error('Visitor not found');

    // Lógica de atualização da entidade
    const updated = new Visitor({
      ...existing.toJSON(),
      ...data,
      updatedAt: new Date()
    });

    return this.visitorRepository.save(updated);
  }

  async deleteVisitor(id: string): Promise<void> {
    await this.visitorRepository.delete(id);
  }
}
