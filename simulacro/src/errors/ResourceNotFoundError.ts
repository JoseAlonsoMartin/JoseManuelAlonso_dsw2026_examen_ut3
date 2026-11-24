export class ResourceNotFoundError extends Error {
  statusCode: number;
  code: string;
  resourceId: string;

  constructor(statusCode: number, message: string, code: string, resourceId: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.resourceId = resourceId;

    this.name = 'ResourceNotFoundError';
  }
}