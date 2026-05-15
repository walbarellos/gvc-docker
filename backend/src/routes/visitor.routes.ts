import type { FastifyInstance } from 'fastify';
import { createVisitorSchema, updateVisitorSchema } from '../schemas/index.js';
import { VisitorRepository } from '../repositories/VisitorRepository.js';
import { VisitorService } from '../services/visitorService.js';
import { VisitorController } from '../controllers/VisitorController.js';

export async function visitorRoutes(app: FastifyInstance) {
  const repository = new VisitorRepository();
  const service = new VisitorService(repository);
  const controller = new VisitorController(service);

  // Listar todos
  app.get('/', { preHandler: [app.authenticate] }, (req, res) => controller.list(req, res));

  // Buscar por ID
  app.get('/:id', { preHandler: [app.authenticate] }, (req, res) => controller.getById(req, res));

  // Criar
  app.post('/', { preHandler: [app.authenticate] }, (req, res) => controller.create(req, res));

  // Atualizar
  app.put('/:id', { preHandler: [app.authenticate] }, (req, res) => controller.update(req, res));

  // Patch - atualizar parcialmente
  app.patch('/:id', { preHandler: [app.authenticate] }, (req, res) => controller.update(req, res));

  // Deletar (admin only)
  app.delete('/:id', { preHandler: [app.authenticate] }, (req, res) => controller.delete(req, res));

  // Buscar por CPF
  app.get('/search/cpf/:cpf', { preHandler: [app.authenticate] }, (req, res) => controller.getByCpf(req, res));
}