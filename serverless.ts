import type { AwsFunction, Serverless } from 'serverless/aws'

const serverlessConfiguration: Serverless = {
  service: {
    name: 'serverless-todo-app',
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  // Add the serverless-webpack plugin
  plugins: [
    'serverless-webpack',
    'serverless-openapi-documentation',
    'serverless-plugin-canary-deployments',
    'serverless-iam-roles-per-function'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    profile: 'serverless-admin',
    stage: "${opt:stage, 'dev'}",
    region: "${opt:region, 'us-east-1'}",
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      TODOS_TABLE: "TODOS-${self:provider.stage}",
      TODOS_USER_INDEX: "UserIdIndex"
    },
    tracing: {
      apiGateway: true,
      lambda: true
    },
    iamRoleStatements: []
  },
  functions: {
    Auth: {
      handler: 'src/lambda/auth/auth0Authorizer.handler'
    },
    
    GetTodos: ({
      handler: 'src/lambda/http/getTodos.handler',
      events: [
        {
          http: {
            method: 'get',
            path: 'todos',
            cors: true,
            authorizer: {
              name: 'Auth'
            }
          }
        }
      ], 
      iamRoleStatements: [
        {
          Effect: 'Allow',
          Action: [
            'dynamodb:Query'
          ],
          Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}'
        },
        {
          Effect: 'Allow',
          Action: [
            'dynamodb:Query'
          ],
          Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}/index/${self:provider.environment.TODOS_USER_INDEX}'
        }
      ]
    } as unknown) as AwsFunction,
    
    CreateTodo: ({
      handler: 'src/lambda/http/createTodo.handler',
      events: [
        {
          http: {
            method: 'post',
            path: 'todos',
            cors: true,
            authorizer: {
              name: 'Auth'
            }
          }
        }
      ],
      iamRoleStatements: [
        {
          Effect: 'Allow',
          Action: [
            'dynamodb:PutItem'
          ],
          Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}'
        }
      ]
    } as unknown) as AwsFunction,
    /*// TODO: Configure this function
    UpdateTodo: {
      handler: 'src/lambda/http/updateTodo.handler',
      events: [
        {
          http: {
            method: 'patch',
            path: 'todos/{todoId}'
          }
        }
      ]
    },
    // TODO: Configure this function
    DeleteTodo: {
      handler: 'src/lambda/http/deleteTodo.handler',
      events: [
        {
          http: {
            method: 'delete',
            path: 'todos/{todoId}'
          }
        }
      ]
    },
    // TODO: Configure this function
    GenerateUploadUrl: {
      handler: 'src/lambda/http/generateUploadUrl.handler',
      events: [
        {
          http: {
            method: 'post',
            path: 'todos/{todoId}/attachment'
          }
        }
      ]
    }*/
  },
  // TODO: Add any necessary AWS resources
  resources: {
    Resources: {
      TodoDynamoDBTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.environment.TODOS_TABLE}',
          BillingMode: 'PAY_PER_REQUEST',
          AttributeDefinitions: [
            {
              AttributeName: 'userId',
              AttributeType: 'S'
            },
            {
              AttributeName: 'todoId',
              AttributeType: 'S'
            }
          ],
          KeySchema: [
            {
              AttributeName: 'todoId',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'userId',
              KeyType: 'RANGE'
            }
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: '${self:provider.environment.TODOS_USER_INDEX}',
              KeySchema: [
                {
                  AttributeName: 'userId',
                  KeyType: 'HASH'
                }
              ],
              Projection: {
                ProjectionType: 'ALL'
              }
            }
          ]
        }
      }
    }
  }
}

module.exports = serverlessConfiguration
