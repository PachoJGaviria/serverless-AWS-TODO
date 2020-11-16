import type { Serverless } from 'serverless/aws';

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
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    stage: "${opt:stage, 'dev'}",
    region: "${opt:region, 'us-east-2'}"
  },
  functions: {
    Auth: {
      handler: 'src/lambda/auth/auth0Authorizer.handler'
    },
    // TODO: Configure this function
    GetTodos: {
      handler: 'src/lambda/http/getTodos.handler'
    },
    // TODO: Configure this function
    CreateTodo: {
      handler: 'src/lambda/http/createTodo.handler',
      events: [
        {
          http: {
            method: 'post',
            path: 'todos'
          }
        }
      ]
    },
    // TODO: Configure this function
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
    }
  },
  // TODO: Add any necessary AWS resources
  resources: {
    Resources: null
  }
}

module.exports = serverlessConfiguration;
