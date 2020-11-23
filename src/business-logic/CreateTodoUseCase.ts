import 'source-map-support/register'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'
import { TodosRepository } from '../persistence/TodosRepository'
import { IllegalArgumentError } from './IllegalArgumentError'
import { v4 as uuidv4 } from 'uuid'

const logger = createLogger('CreateTodo')
const todosRepository = new TodosRepository()

export async function createTodo(name: string, dueDate: string, userId: string): Promise<TodoItem> {
  if (!name) {
    throw new IllegalArgumentError('The TODO`s name is required.', logger)
  }
  logger.info(`Create new TODO for UserId: ${userId} - name: ${name}`)
  const todoId = uuidv4()
  const todoItem: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    name,
    dueDate,
    done: false
  } 
  await todosRepository.save(todoItem)
  return todoItem
}