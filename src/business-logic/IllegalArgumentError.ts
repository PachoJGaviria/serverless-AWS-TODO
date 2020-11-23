import 'source-map-support/register'
import * as winston from 'winston'

export class IllegalArgumentError extends Error {

  readonly statusCode: number

  constructor(readonly message: string, readonly logger: winston.Logger) {
    super(message)
    this.statusCode = 400
    logger.error(message)
  }
}