import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        details: result.error.format()
      });
    }
    request.body = result.data;
  };
};
