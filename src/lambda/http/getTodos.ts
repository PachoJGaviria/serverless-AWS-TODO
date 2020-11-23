import 'source-map-support/register'
import { getAllTodosByUser } from '../../business-logic/GetAllTodosByUser'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createLogger } from '../../utils/logger'
import { TodoItem } from '../../models/TodoItem'

const logger = createLogger('GetTodosController')

function mapResponse(todoItems: TodoItem[]): string {
  const todos = todoItems.map(todo => {
    const { userId, ...item } = todo
    return item
  })
  return JSON.stringify({
    items: todos
  })
}

const getTodosController = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {  
  const userId = getUserId(event)
  logger.info(`Get All todos by user ${userId}`)
  const todos = await getAllTodosByUser(userId)
  return {
    statusCode: 200,
    body: mapResponse(todos)
  }
}

const handler = middy(getTodosController)
handler
  .use(httpErrorHandler())
  .use(cors({credentials: true}))

export { handler }
