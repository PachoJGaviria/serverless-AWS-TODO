import 'source-map-support/register'
import { createLogger } from '../utils/logger'
import { TodosRepository } from '../persistence/TodosRepository'
import { findById } from './findTodoById'

const logger = createLogger('CreateTodo')
const todosRepository = new TodosRepository()

export async function updateTodo(todoId: string, userId: string, dueDate: string, done: boolean): Promise<void> {
  const todoItem = await findById(todoId, userId)
  todoItem.dueDate = dueDate
  todoItem.done = done
  logger.info(`Updating TODO todoId: ${todoId} - dueDate ${todoItem.dueDate} - done: ${todoItem.done}`)
  await todosRepository.save(todoItem)
}