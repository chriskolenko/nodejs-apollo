import express from 'express';
import graphqlHTTP from 'express-graphql';
import { makeExecutableSchema } from 'graphql-tools';
import debugFactory from 'debug';
import graphql from '../graphql';

const app = express();

(async () => {
  const debug = debugFactory('api::server');

  try {
    const config = await graphql();
    const schema = makeExecutableSchema(config);

    app.use(
      '/graphql',
      graphqlHTTP({
        schema,
        graphiql: true,
      }),
    );

    // Start the server after all data has loaded.
    app.listen(4000);

    debug('Server Started! http://localhost:4000/graphql');
  } catch (error) {
    debug('[loadMarkdownIntoDb]', error);
  }
})();
