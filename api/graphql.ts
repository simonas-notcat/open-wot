import { Agent, Gql, Entities } from 'daf-core'
import { IdentityProvider } from 'daf-ethr-did'
import { KeyStore } from 'daf-core'
import { KeyManagementSystem } from 'daf-libsodium'
import { IdentityStore } from 'daf-core'
import { DafResolver } from 'daf-resolver'
import { JwtMessageHandler } from 'daf-did-jwt'
import { W3cMessageHandler } from 'daf-w3c'
import { W3cActionHandler } from 'daf-w3c'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import merge from 'lodash.merge'
import { createConnection, getConnection } from 'typeorm'

const keyStore = new KeyStore()
const kms = new KeyManagementSystem(keyStore)
const identityStore = new IdentityStore('rinkeby-ethr')
const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

const rinkebyIdentityProvider = new IdentityProvider({
  kms,
  identityStore,
  network: 'rinkeby',
  rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
})

const didResolver = new DafResolver({ infuraProjectId })
const messageHandler = new JwtMessageHandler()
messageHandler.setNext(new W3cMessageHandler())

const actionHandler = new W3cActionHandler()

export const agent = new Agent({
  didResolver,
  identityProviders: [rinkebyIdentityProvider],
  actionHandler,
  messageHandler,
})

const server = new ApolloServer({
  typeDefs: [
    Gql.baseTypeDefs,
    Gql.Core.typeDefs
  ],
  resolvers: merge(
    Gql.Core.resolvers,
  ),
  context: async () => {
    try {
      const connection = getConnection()
      await connection.close()
    } catch (e) {
    }
    await createConnection({
      type: 'postgres',
      database: process.env.DB,
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      synchronize: false,
      entities: Entities
    })
      
    return { agent }
  },
  playground: true,
  introspection: true,
})

const app = express()
server.applyMiddleware({ app, path: '/api/graphql' })

module.exports = app