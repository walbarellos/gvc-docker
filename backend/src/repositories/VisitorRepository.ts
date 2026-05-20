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
      parentalAuthorization: prismaVisitor.parentalAuthorization,
      authorizationDate: prismaVisitor.authorizationDate,
      responsibleName: prismaVisitor.responsibleName,
      responsibleId: prismaVisitor.responsibleId,
      authorizationDocType: prismaVisitor.authorizationDocType,
      authorizationPresented: prismaVisitor.authorizationPresented,
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
      passport: visitor.passport,
      isForeigner: visitor.isForeigner,
      gender: visitor.gender,
      birthDate: visitor.birthDate,
      email: visitor.email,
      phone: visitor.phone,
      address: visitor.address,
      category: visitor.category,
      photoUrl: visitor.photoUrl,
      parentalAuthorization: visitor.parentalAuthorization,
      authorizationDate: visitor.authorizationDate,
      responsibleName: visitor.responsibleName,
      responsibleId: visitor.responsibleId,
      authorizationDocType: visitor.authorizationDocType,
      authorizationPresented: visitor.authorizationPresented,
      updatedAt: new Date(),
    };

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

  async createAuthorizationLog(data: { visitorId: string, authorizedBy: string, docType: string, details?: string }): Promise<void> {
    await this.prisma.authorizationLog.create({
      data: {
        visitorId: data.visitorId,
        authorizedBy: data.authorizedBy,
        docType: data.docType,
        details: data.details,
      }
    });
  }
}
