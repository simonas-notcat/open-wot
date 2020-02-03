import { NowRequest, NowResponse } from '@now/node'
import * as Daf from 'daf-core'
import * as DS from 'daf-data-store'
import * as DidJwt from 'daf-did-jwt'
import * as W3c from 'daf-w3c'
import * as SD from 'daf-selective-disclosure'
import * as TG from 'daf-trust-graph'
import * as DBG from 'daf-debug'
import * as URL from 'daf-url'
import { NodeSqlite3 } from 'daf-node-sqlite3'
import { EthrDidFsController } from 'daf-ethr-did-fs'
import { DafResolver } from 'daf-resolver'
import { ApolloServer } from 'apollo-server-micro'
import merge from 'lodash.merge'
import ws from 'ws'


let didResolver = new DafResolver({ infuraProjectId: '5ffc47f65c4042ce847ef66a3fa70d4c' })

const identityControllers = [new EthrDidFsController('/Users/simonas/dev/simonas-notcat/open-wot/api/identity-store.json')]
const serviceControllers = [TG.ServiceController]

const messageValidator = new DBG.MessageValidator()
messageValidator
  .setNext(new URL.MessageValidator())
  .setNext(new DidJwt.MessageValidator())
  .setNext(new W3c.MessageValidator())
  .setNext(new SD.MessageValidator())

const actionHandler = new DBG.ActionHandler()
actionHandler
  .setNext(new TG.ActionHandler())
  .setNext(new W3c.ActionHandler())
  .setNext(new SD.ActionHandler())

export const core = new Daf.Core({
  identityControllers,
  serviceControllers,
  didResolver,
  messageValidator,
  actionHandler,
})

const dataStore = new DS.DataStore(new NodeSqlite3('./data-store.sqlite3'))

const server = new ApolloServer({
  typeDefs: [
    Daf.Gql.baseTypeDefs,
    DS.Gql.typeDefs,
    Daf.Gql.Core.typeDefs,
    Daf.Gql.IdentityManager.typeDefs,
    TG.Gql.typeDefs,
    W3c.Gql.typeDefs,
    SD.Gql.typeDefs,
  ],
  resolvers: merge(
    Daf.Gql.Core.resolvers,
    Daf.Gql.IdentityManager.resolvers,
    DS.Gql.resolvers,
    TG.Gql.resolvers,
    W3c.Gql.resolvers,
    SD.Gql.resolvers,
  ),
  context: ({ req }) => {
    // Authorization is out of scope for this example,
    // but this is where you could add your auth logic
    // const token = req.headers.authorization || ''
    // if (token !== 'Bearer hardcoded-example-token') {
    //   throw Error('Auth error')
    // }

    return { core, dataStore }
  },
  introspection: true,
})

core.on(Daf.EventTypes.validatedMessage, async (message: Daf.Message) => {
  await dataStore.saveMessage(message)
})

module.exports = async(req: NowRequest, res: NowResponse) => {
  TG.ServiceController.webSocketImpl = ws

  await dataStore.initialize()
  // await core.setupServices()

	const handler = server.createHandler({ path: '/api/graphql' })
	const callback = () => {
		// client.close;
	};

	return handler(req, res)

}
