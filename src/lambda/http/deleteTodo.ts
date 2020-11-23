import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils'
import { deleteTodo } from '../../business-logic/DeleteTodoById'
import { createLogger } from '../../utils/logger'

const logger = createLogger('DeleteTodoController')

const deleteController: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  logger.info(`Delete TODO with todoId: ${todoId} and userId: ${userId}`)
  await deleteTodo(todoId, userId)
  return {
    statusCode: 200,
    body: null
  }
}

const handler = middy(deleteController)
handler
  .use(httpErrorHandler())
  .use(cors({credentials: true}))

export { handler }
