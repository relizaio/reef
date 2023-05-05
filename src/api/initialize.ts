import express, { Express, Request, Response } from 'express'
import http from 'http'
import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { expressMiddleware } from '@apollo/server/express4'
import schema from './gql-schema'
import resolvers from './resolvers'

const app: Express = express();
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

const httpServer = http.createServer(app)

app.get('/hello', function(req: Request, res: Response){
    res.send('<h1>Hello world</h1>');
})

const server = new ApolloServer({
    typeDefs: schema.typeDefs,
    resolvers: resolvers.resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
})

async function startup () {
    await server.start()

    app.use(expressMiddleware(server))
    await new Promise<void>(resolve => httpServer.listen({ port: 4001 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4001`);
}

export default {
    startup: startup
}