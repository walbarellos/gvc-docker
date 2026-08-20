import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseController } from './BaseController.js';
import { VisitorService } from '../services/visitorService.js';
import { createVisitorBodySchema, updateVisitorBodySchema } from '../schemas/index.js';
import { prisma } from '../lib/prisma.js';

export class VisitorController extends BaseController {
  constructor(private visitorService: VisitorService) {
    super();
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { cpf, passport, order } = request.query as any;
      const visitors = await this.visitorService.listVisitors({ cpf, passport, order });
      this.handleSuccess(reply, visitors.map(v => v.toJSON()));
    } catch (error) {
      this.handleError(error, reply, 'VisitorController.list');
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params as { id: string };
      const visitor = await this.visitorService.getVisitorById(id);
      this.handleSuccess(reply, visitor ? visitor.toJSON() : null);
    } catch (error) {
      this.handleError(error, reply, 'VisitorController.getById');
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const parsed = createVisitorBodySchema.safeParse(request.body);
      if (!parsed.success) {
        this.handleSuccess(reply, { error: 'Dados inválidos', details: parsed.error.issues }, 400);
        return;
      }
      const visitor = await this.visitorService.createVisitor(parsed.data);
      this.handleSuccess(reply, visitor.toJSON(), 201);
    } catch (error) {
      this.handleError(error, reply, 'VisitorController.create');
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params as { id: string };
      const parsed = updateVisitorBodySchema.safeParse(request.body);
      if (!parsed.success) {
        this.handleSuccess(reply, { error: 'Dados inválidos', details: parsed.error.issues }, 400);
        return;
      }
      const visitor = await this.visitorService.updateVisitor(id, parsed.data);
      this.handleSuccess(reply, visitor.toJSON());
    } catch (error) {
      this.handleError(error, reply, 'VisitorController.update');
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params as { id: string };
      const user = (request as any).user;
      const scopeSpaceId = !user || user.perfil === 'administrador' ? null : (user.espacoId || null);
      if (scopeSpaceId) {
        const visit = await prisma.visit.findFirst({
          where: { visitorId: id, espacoId: scopeSpaceId },
          select: { id: true },
        });
        if (!visit) {
          return reply.status(403).send({ error: 'Sem permissão para excluir este visitante' });
        }
      }
      await this.visitorService.deleteVisitor(id);
      this.handleSuccess(reply, { success: true });
    } catch (error) {
      this.handleError(error, reply, 'VisitorController.delete');
    }
  }

  async getByCpf(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { cpf } = request.params as { cpf: string };
      const user = (request as any).user;
      const scopeSpaceId = !user || user.perfil === 'administrador' ? null : (user.espacoId || null);
      const visitor = await this.visitorService.getVisitorByCpf(cpf);
      if (scopeSpaceId && visitor) {
        const visit = await prisma.visit.findFirst({
          where: { visitorId: visitor.id, espacoId: scopeSpaceId },
          select: { id: true },
        });
        if (!visit) {
          return reply.status(403).send({ error: 'Sem permissão para acessar este visitante' });
        }
      }
      this.handleSuccess(reply, visitor ? visitor.toJSON() : null);
    } catch (error) {
      this.handleError(error, reply, 'VisitorController.getByCpf');
    }
  }
}
