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
  package: {
    individually: true,
    excludeDevDependencies: true,
    exclude: [
      'client/**',
      '.docs/**'
    ]
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
      TODOS_USER_INDEX: "UserIdIndex",
      TODOS_S3_BUCKET: "todo-pachojgaviria-${self:provider.stage}",
      SIGNED_URL_EXPIRATION: 300
    },
    tracing: {
      apiGateway: true,
      lambda: true
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: [
          'xray:PutTraceSegments',
          'xray:PutTelemetryRecords'
        ],
        Resource: '*'
      }
    ]
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
            },
            request: {
              schema: {
                'application/json': '${file(src/models/create-todo-request.json)}'
              }
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

    UpdateTodo: ({
      handler: 'src/lambda/http/updateTodo.handler',
      events: [
        {
          http: {
            method: 'patch',
            path: 'todos/{todoId}',
            cors: true,
            authorizer: {
              name: 'Auth'
            },
            request: {
              schema: {
                'application/json': '${file(src/models/update-todo-request.json)}'
              }
            }
          }
        }
      ],
      iamRoleStatements: [
        {
          Effect: 'Allow',
          Action: [
            'dynamodb:PutItem',
            'dynamodb:Query'
          ],
          Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}'
        }
      ]
    } as unknown) as AwsFunction,

    DeleteTodo: ({
      handler: 'src/lambda/http/deleteTodo.handler',
      events: [
        {
          http: {
            method: 'delete',
            path: 'todos/{todoId}',
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
            'dynamodb:DeleteItem'
          ],
          Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}'
        }
      ]
    } as unknown) as AwsFunction,
  
    GenerateUploadUrl: ({
      handler: 'src/lambda/http/generateUploadUrl.handler',
      events: [
        {
          http: {
            method: 'post',
            path: 'todos/{todoId}/attachment',
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
            'dynamodb:Query',
            'dynamodb:PutItem'
          ],
          Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}'
        },
        {
          Effect: 'Allow',
          Action: [
            's3:PutObject',
            's3:GetObject'
          ],
          Resource: 'arn:aws:s3:::${self:provider.environment.TODOS_S3_BUCKET}/*'
        }
      ]
    } as unknown) as AwsFunction
  },
  resources: {
    Resources: {
      APIGatewayDefault4XXResponse: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
            'gatewayresponse.header.Access-Control-Allow-Methods': "'PATCH,DELETE,GET,OPTIONS,POST'"
          },
          ResponseType: 'DEFAULT_4XX',
          RestApiId: {
            Ref: 'ApiGatewayRestApi'
          }
        }
      },
      
      TodoDynamoDBTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.environment.TODOS_TABLE}',
          BillingMode: 'PAY_PER_REQUEST',
          AttributeDefinitions: [
            {
              AttributeName: 'todoId',
              AttributeType: 'S'
            },
            {
              AttributeName: 'userId',
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
      },

      TodoBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${self:provider.environment.TODOS_S3_BUCKET}',
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedOrigins: ["*"],
                AllowedHeaders: ["*"],
                AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
                MaxAge: 3000
              }
            ]
          }
        }
      },

      TodoBucketPolicy: {
        Type: 'AWS::S3::BucketPolicy',
        Properties: {
          PolicyDocument: {
            Id: 'TodoPublicBucketPolicy',
            Version: '2012-10-17',
            Statement: [
              {
                Sid: 'PublicGetBucketObjects',
                Effect: 'Allow',
                Principal: '*',
                Action: 's3:GetObject',
                Resource: 'arn:aws:s3:::${self:provider.environment.TODOS_S3_BUCKET}/*'
              }
            ]
          },
          Bucket: {
            'Ref': 'TodoBucket'
          }
        }
      }
    }
  }
}

module.exports = serverlessConfiguration
