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

  async getById(todoId: string, userId: string): Promise<TodoItem> {
    logger.info(`Get TODO by todoId: ${todoId} - userId: ${userId}`)
    
    const result = await this.dynamoDBDocClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'todoId = :todoId and userId = :userId',
      ExpressionAttributeValues: {
        ':todoId': todoId,
        ':userId': userId
      }
    }).promise()
    const todo = result.Items.length > 0 ? result.Items[0] : undefined
    return todo as TodoItem
  }

  async getAllTodosByUser(userId: string): Promise<TodoItem[]> {
    logger.info(`Get all TODOS by user ${userId}`)

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
    logger.info(`Save a TODO ${todoItem}`)
    await this.dynamoDBDocClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()
  }

  async deleteById(todoId: string, userId: string): Promise<void> {
    logger.info(`Delete a TODO with todoId: ${todoId} userId: ${userId}`)
    await this.dynamoDBDocClient.delete({
      TableName: this.todosTable,
      Key: { todoId, userId }
    }).promise()
  }
}
