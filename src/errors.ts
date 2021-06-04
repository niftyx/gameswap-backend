import * as HttpStatus from "http-status-codes";

export abstract class APIBaseError extends Error {
  public abstract statusCode: number;
  public isAPIError = true;
}

export class NotFoundError extends APIBaseError {
  public statusCode = HttpStatus.NOT_FOUND;
}

export class InternalServerError extends APIBaseError {
  public statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
}

export abstract class AlertError {
  public abstract message: string;
  public shouldAlert: boolean = true;
}
