import 'source-map-support/register'
import { createLogger } from '../utils/logger'
import { TodosRepository } from '../persistence/TodosRepository'
import { TodoNotFoundError } from './TodoNotFoundError';

const logger = createLogger('CreateTodo')
const todosRepository = new TodosRepository()

export async function updateTodo(todoId: string, userId: string, dueDate: string, done: boolean): Promise<void> {
  const todoItem = await todosRepository.getById(todoId, userId)
  if (!todoItem) {
    throw new TodoNotFoundError(`TODO not found with id: ${todoId} - userId: ${userId}`, logger)
  }
  todoItem.dueDate = dueDate
  todoItem.done = done
  await todosRepository.save(todoItem)
}