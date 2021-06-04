import { RevertError } from "@0x/utils";
import * as express from "express";
import * as HttpStatus from "http-status-codes";

import { APIBaseError, InternalServerError } from "../errors";
import { logger } from "../logger";

/**
 * Catches errors thrown by our code and serialies them
 */
export function errorHandler(
  err: Error,
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  // If you call next() with an error after you have started writing the response
  // (for example, if you encounter an error while streaming the response to the client)
  // the Express default error handler closes the connection and fails the request.
  if (res.headersSent) {
    return next(err);
  }

  res.status(400).send(err);

  // If the error is an internal error, log it with the stack!
  // All other error responses are logged as part of request logging
  if (isAPIError(err) && isInternalServerError(err)) {
    // hack (xianny): typeorm errors contain the SQL query which breaks the docker char limit and subsequently breaks log parsing
    if ((err as any).query) {
      (err as any).query = undefined;
    }
    logger.error(err);
    next(err);
  }
}

// tslint:disable-next-line:completed-docs
export function isAPIError(error: Error): error is APIBaseError {
  return (error as APIBaseError).isAPIError;
}

// tslint:disable-next-line:completed-docs
export function isRevertError(error: Error): error is RevertError {
  const { signature, selector } = error as RevertError;
  return signature !== undefined && selector !== undefined;
}

function isInternalServerError(
  error: APIBaseError
): error is InternalServerError {
  return error.statusCode === HttpStatus.INTERNAL_SERVER_ERROR;
}
