import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodoRepository')
function createDynamoDBDocumentClient(): DocumentClient {
  return new XAWS.DynamoDB.DocumentClient()
}

export class TodosRepository {
  constructor(
    private readonly dynamoDBDocClient: DocumentClient = createDynamoDBDocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosUserIndex = process.env.TODOS_USER_INDEX) {
  }

  async getAllTodosByUser(userId: string): Promise<TodoItem[]> {
    logger.info(`TodosRepository: Get all TODOS by user ${userId}`)

    const result = await this.dynamoDBDocClient.query({
      TableName: this.todosTable,
      IndexName: this.todosUserIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()
    return result.Items as TodoItem[]
  }

  async save(todoItem: TodoItem): Promise<void> {
    logger.info(`TodoRepository: Save a TODO ${todoItem}`)
    await this.dynamoDBDocClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()
  }
}
