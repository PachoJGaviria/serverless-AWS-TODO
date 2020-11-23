import 'source-map-support/register'
import { APIGatewayTokenAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// URL that can be used to download a certificate that can be used to verify JWT token signature.
const jwksUrl = 'https://dev-8gn1qd2h.us.auth0.com/.well-known/jwks.json'

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  const jwk = await getJwk(jwt.header.kid)
  const cert = certToPEM(jwk.x5c[0]) 
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

async function getJwk(jwtKid: string): Promise<Jwk> {
  logger.info(`Getting the jwks from ${jwksUrl}`)
  const response = await Axios.get(jwksUrl)
  const jwks = response.data.keys as Jwk[]
  if (!jwks || !jwks.length) {
    const msg = 'Not keys found'
    logger.error(msg)
    throw msg
  }
  // Filter all jwks for signature verification, RSA (RS256), public key and kid
  const jwk = jwks
    .filter(key => key.use === 'sig' && key.kty === 'RSA' && key.kid 
            && key.x5c && key.x5c.length)
    .find(key => key.kid === jwtKid)
  if (!jwk) {
    const msg = `Not signature verification key found for kid ${jwtKid}`
    logger.error(msg)
    throw msg
  }
  return jwk
}

function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n')
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
  return cert
}

function getToken(authHeader: string): string {
  if (!authHeader) {
    throw new Error('No authentication header')
  }

  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authentication header')
  }

  const split = authHeader.split(' ')
  const token = split[1]
  return token
}
