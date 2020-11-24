
import 'source-map-support/register'
import { TodoNotFoundError } from './TodoNotFoundError'
import { TodosRepository } from '../persistence/TodosRepository'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'

const logger = createLogger('findById')
const todosRepository = new TodosRepository()

export async function findById(todoId: string, userId: string): Promise<TodoItem> {
  const todoItem = await todosRepository.getById(todoId, userId)
  if (!todoItem) {
    throw new TodoNotFoundError(`TODO not found with todoId: ${todoId} - userId: ${userId}`, logger)
  }
  logger.info(`TODO fount with todoId: ${todoId} - userId: ${userId}`)
  return todoItem
}