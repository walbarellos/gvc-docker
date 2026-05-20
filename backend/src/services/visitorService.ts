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
    // BUG 2 FIX: Verificar CPF duplicado antes de criar
    const cpf = data.cpf;
    if (cpf) {
      const existing = await this.visitorRepository.findByCpf(cpf);
      if (existing) {
        const error: any = new Error('CPF já cadastrado no sistema.');
        error.statusCode = 409;
        throw error;
      }
    }

    const visitor = new Visitor({
      id: crypto.randomUUID(),
      fullName: data.fullName || data.full_name,
      cpf: data.cpf,
      isForeigner: data.is_foreigner || data.isForeigner || false,
      birthDate: data.birth_date ? new Date(data.birth_date) : (data.birthDate ? new Date(data.birthDate) : null),
      parentalAuthorization: data.parentalAuthorization || false,
      responsibleName: data.responsibleName || null,
      responsibleId: data.responsibleId || null,
      authorizationDocType: data.authorizationDocType || null,
      authorizationPresented: data.authorizationPresented || false,
      authorizationDate: data.parentalAuthorization ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      // ... outros campos mapeados
    } as any);

    const validation = visitor.canRegister();
    if (!validation.allowed) {
      throw new Error(validation.reason!);
    }

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

  async authorizeVisitor(id: string, responsibleName: string, docType: string, authorizedBy: string): Promise<Visitor> {
    const existing = await this.visitorRepository.findById(id);
    if (!existing) throw new Error('Visitor not found');

    const authorized = existing.authorizeParental(responsibleName, docType);
    
    await this.visitorRepository.createAuthorizationLog({
      visitorId: id,
      authorizedBy,
      docType,
      details: `Autorização parental concedida por ${responsibleName}`
    });
    
    return this.visitorRepository.save(authorized);
  }
}
