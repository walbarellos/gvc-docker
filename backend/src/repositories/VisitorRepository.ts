import { PrismaClient, Visitor as PrismaVisitor } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { Visitor, Gender } from '../domain/entities/Visitor.js';
import { IVisitorRepository } from '../domain/repositories/IVisitorRepository.js';

export class VisitorRepository implements IVisitorRepository {
  private prisma: PrismaClient = prisma;

  private mapToDomain(prismaVisitor: PrismaVisitor): Visitor {
    return new Visitor({
      id: prismaVisitor.id,
      fullName: prismaVisitor.fullName,
      cpf: prismaVisitor.cpf,
      passport: prismaVisitor.passport,
      isForeigner: prismaVisitor.isForeigner,
      gender: prismaVisitor.gender as Gender,
      birthDate: prismaVisitor.birthDate,
      email: prismaVisitor.email,
      phone: prismaVisitor.phone,
      address: prismaVisitor.address,
      category: prismaVisitor.category,
      photoUrl: prismaVisitor.photoUrl,
      createdAt: prismaVisitor.createdAt,
      updatedAt: prismaVisitor.updatedAt,
    });
  }

  async findAll(filters: { cpf?: string; passport?: string; order?: 'asc' | 'desc' }): Promise<Visitor[]> {
    const where: any = {};
    if (filters.cpf) where.cpf = filters.cpf;
    if (filters.passport) where.passport = filters.passport;

    const visitors = await this.prisma.visitor.findMany({
      where,
      orderBy: { createdAt: filters.order || 'desc' },
    });

    return visitors.map(v => this.mapToDomain(v));
  }

  async findById(id: string): Promise<Visitor | null> {
    const v = await this.prisma.visitor.findUnique({ where: { id } });
    return v ? this.mapToDomain(v) : null;
  }

  async findByCpf(cpf: string): Promise<Visitor | null> {
    const v = await this.prisma.visitor.findUnique({ where: { cpf } });
    return v ? this.mapToDomain(v) : null;
  }

  async save(visitor: Visitor): Promise<Visitor> {
    const data = {
      fullName: visitor.fullName,
      cpf: visitor.cpf,
      // ... mapear outros campos conforme necessário para o prisma.upsert ou create/update
    } as any;

    const saved = await this.prisma.visitor.upsert({
      where: { id: visitor.id },
      update: data,
      create: { ...data, id: visitor.id }
    });

    return this.mapToDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.visitor.delete({ where: { id } });
  }
}
