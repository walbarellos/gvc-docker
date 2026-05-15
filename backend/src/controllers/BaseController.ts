import { FastifyReply, FastifyRequest } from 'fastify';

export abstract class BaseController {
  protected handleSuccess<T>(reply: FastifyReply, data: T, statusCode = 200): void {
    reply.status(statusCode).send(data);
  }

  protected handleError(error: any, reply: FastifyReply, context: string): void {
    // Aqui integraríamos com Sentry no futuro
    // Sentry.captureException(error);
    
    requestLog(reply.request, `Error in ${context}: ${error.message}`);

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    reply.status(statusCode).send({
      error: error.name || 'Error',
      message,
      context
    });
  }
}

function requestLog(request: FastifyRequest, message: string) {
  request.log.error(message);
}
