import 'source-map-support/register'
import { getAllTodosByUser } from '../../business-logic/UseCasesTodos'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils';
import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { createLogger } from '../../utils/logger';

const logger = createLogger('GetTodosController')

const getTodosController = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {  
  const userId = getUserId(event);
  logger.info(`Lambda: Get All todos by user ${userId}`)
  const todos = await getAllTodosByUser(userId);
  return {
    statusCode: 200,
    body: JSON.stringify({
      items: todos
    })
  };
}

const handler = middy(getTodosController)
handler
  .use(httpErrorHandler())
  .use(cors({credentials: true}))

export { handler }
