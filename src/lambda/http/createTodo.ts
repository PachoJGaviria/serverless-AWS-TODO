import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../business-logic/CreateTodoUseCase'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { TodoItem } from '../../models/TodoItem'

const logger = createLogger('CreateTodoController')

function mapResponse(todoItem: TodoItem): string {
  const { userId, ...response } = todoItem
  return JSON.stringify({item: response})
}

const createTodoController: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event)
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  logger.info(`Create a new TODO: User ${userId} - Name ${newTodo.name} - DueDate ${newTodo.dueDate}`)
  const todoItem = await createTodo(newTodo.name, newTodo.dueDate, userId)
  return {
    statusCode: 201,
    body: mapResponse(todoItem)
  } 
}
const handler = middy(createTodoController)
handler
  .use(httpErrorHandler())
  .use(cors({credentials: true}))

export { handler }

