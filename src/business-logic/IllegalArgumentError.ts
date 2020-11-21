export class IllegalArgumentError extends Error {

  readonly statusCode: number

  constructor(readonly message: string) {
    super(message)
    this.statusCode = 400
  }
}