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
    const isServerError = statusCode >= 500;

    reply.status(statusCode).send({
      error: isServerError ? 'Internal Server Error' : (error.name || 'Error'),
      message: isServerError ? 'Ocorreu um erro inesperado no servidor.' : error.message,
      correlationId: reply.request.id,
      ...(isServerError ? {} : { context })
    });
  }
}

function requestLog(request: FastifyRequest, message: string) {
  request.log.error(message);
}
