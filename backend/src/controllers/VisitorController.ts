import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseController } from './BaseController.js';
import { VisitorService } from '../services/visitorService.js';

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
      const visitor = await this.visitorService.createVisitor(request.body);
      this.handleSuccess(reply, visitor.toJSON(), 201);
    } catch (error) {
      this.handleError(error, reply, 'VisitorController.create');
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params as { id: string };
      const visitor = await this.visitorService.updateVisitor(id, request.body);
      this.handleSuccess(reply, visitor.toJSON());
    } catch (error) {
      this.handleError(error, reply, 'VisitorController.update');
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { id } = request.params as { id: string };
      await this.visitorService.deleteVisitor(id);
      this.handleSuccess(reply, { success: true });
    } catch (error) {
      this.handleError(error, reply, 'VisitorController.delete');
    }
  }

  async getByCpf(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { cpf } = request.params as { cpf: string };
      const visitor = await this.visitorService.getVisitorByCpf(cpf);
      this.handleSuccess(reply, visitor ? visitor.toJSON() : null);
    } catch (error) {
      this.handleError(error, reply, 'VisitorController.getByCpf');
    }
  }
}
