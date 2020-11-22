import 'source-map-support/register'
import { TodoItem } from "../models/TodoItem"
import { TodosRepository } from '../persistence/TodosRepository'
import { createLogger } from "../utils/logger"
import { IllegalArgumentError } from './IllegalArgumentError'

const logger = createLogger('GetAllTodosByUser')
const todosRepository = new TodosRepository()

export async function getAllTodosByUser(userId: string): Promise<TodoItem[]> {
  if (!userId) {
    const errorMessage = 'The userId is required.'
    logger.error(errorMessage)
    throw new IllegalArgumentError(errorMessage)
  }
  return todosRepository.getAllTodosByUser(userId)
}

