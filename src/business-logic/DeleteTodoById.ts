import 'source-map-support/register'
import { createLogger } from '../utils/logger'
import { TodosRepository } from '../persistence/TodosRepository'
import { IllegalArgumentError } from './IllegalArgumentError';

const logger = createLogger('DeleteTodo')
const todosRepository = new TodosRepository()

function validId(todoId: string, userId: string): void {
  if (!todoId) {
    throw new IllegalArgumentError('The todo id is required.', logger)
  }
  if (!userId) {
    throw new IllegalArgumentError('The user id is required.', logger)  
  }
}

export async function deleteTodo(todoId: string, userId: string): Promise<void> {
  validId(todoId, userId)
  await todosRepository.deleteById(todoId, userId);
}

