import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../business-logic/UpdateTodoById'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('UpdateTodoController')

const updateController : APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  logger.info(`Complete a TODO todoId: ${todoId} - userId: ${userId} - ${JSON.stringify(updatedTodo)}`)
  await updateTodo(todoId, userId, updatedTodo.dueDate, updatedTodo.done)
  return {
    statusCode: 200,
    body: null
  }
}

const handler = middy(updateController)
handler
  .use(httpErrorHandler())
  .use(cors({credentials: true}))
export { handler }
  