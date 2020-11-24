import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { updateAttachmentUrl } from '../../business-logic/UpdateAttachmentUrl'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({ signatureVersion: 'v4' })
const todoBucket = process.env.TODOS_S3_BUCKET
const expiration: number = +process.env.SIGNED_URL_EXPIRATION
const logger = createLogger('getUploadUrlController')

function getSignedUrl(todoId: string): string {
  return s3.getSignedUrl('putObject', {
    Bucket: todoBucket,
    Key: todoId,
    Expires: expiration
  })
}

const getUploadUrlController: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const s3Url = `https://${todoBucket}.s3.amazonaws.com/${todoId}`
  await updateAttachmentUrl(todoId, userId, s3Url)
  const url = getSignedUrl(todoId)
  logger.info(`Signed URL generated. todoId: ${todoId} - userId: ${userId} - URL: ${url}`)
  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}

const handler = middy(getUploadUrlController)
handler
  .use(httpErrorHandler())  
  .use(cors({credentials: true}))
export { handler }