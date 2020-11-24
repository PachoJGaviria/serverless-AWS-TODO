import 'source-map-support/register'
import { findById } from './findTodoById'
import { TodosRepository } from '../persistence/TodosRepository'

const todosRepository = new TodosRepository()

export async function updateAttachmentUrl(todoId: string,userId: string, url: string) {
  const todoItem = await findById(todoId,userId)
  todoItem.attachmentUrl= url
  await todosRepository.save(todoItem)
}