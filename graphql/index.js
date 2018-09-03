import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import { loadMarkdownIntoDb } from 'graphql-markdown';
import {
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime
} from 'graphql-iso-date';
import debugFactory from 'debug';

import {
  GraphQLURL,
  GraphQLEmailAddress,
} from './scalars';

import serverResolvers from './server/resolvers.js';

// Simple example of mapping the relative images stored with our .md
// files to the URL path that we will access/serve them from.
const serveImagesFromServer = ({ imgPath, contentRoot }) =>
  `/images${imgPath.slice(contentRoot.length)}`;

// Create our options for processing the markdown & images.
const options = {
  contentRoot: `${__dirname}/../content`,
  imageFunc: serveImagesFromServer,
};

export default async () => {
  const debug = debugFactory('api::graphql');

  const {
    graphqlMarkdownTypeDefs,
    graphqlMarkdownResolvers,
    numberOfFilesInserted,
  } = await loadMarkdownIntoDb(options);

  debug(`Memory DB completed!\n${numberOfFilesInserted} ContentItems loaded!`);

  const typesArray = [
    graphqlMarkdownTypeDefs,
    ...fileLoader(`${__dirname}/**/*.graphql`),
  ]

  const typeDefs = mergeTypes(typesArray, { all: true });

  const resolvers = mergeResolvers([
    serverResolvers(),
    graphqlMarkdownResolvers,
    {
      Date: GraphQLDate,
      Time: GraphQLTime,
      DateTime: GraphQLDateTime,
      URL: GraphQLURL,
      EmailAddress: GraphQLEmailAddress,
    },
  ]);

  return {
    typeDefs,
    resolvers,
  };
};
