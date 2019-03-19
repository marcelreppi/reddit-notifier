const AWS = require('aws-sdk')

const docClient = new AWS.DynamoDB.DocumentClient({
  region: 'eu-central-1'
})

exports.handler = async (event) => {
  const id = event.pathParameters.id
  const params = {
    TableName: 'reddalert-serverless-subreddits',
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': id,
    }
  }
  const result = await docClient.query(params).promise()

  let subreddits = result.Items ? result.Items : []

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      subreddits
    }),
  };
  return response;
}