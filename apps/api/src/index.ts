import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import dotenv from 'dotenv';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello.resolver';
import { MissionResolver } from './resolvers/mission.resolver';

dotenv.config();

const PORT = parseInt(process.env.API_PORT || '4000', 10);

async function bootstrap() {
  const schema = await buildSchema({
    resolvers: [HelloResolver, MissionResolver],
  });

  const server = new ApolloServer({
    schema,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
  });

  console.log(`EcoFieldOps API ready at ${url}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start API', err);
  process.exit(1);
});
