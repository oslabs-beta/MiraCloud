const { GraphQLSchema, GraphQLObjectType }= require('graphql');
const awsSDK = require('aws-sdk');
const { AwsApiParser } = require('graphql-compose-aws');
const awsApiParser = new AwsApiParser({
  awsSDK,
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      // Full API
      aws: awsApiParser.getFieldConfig()
    },
  }),
});

module.exports = schema;