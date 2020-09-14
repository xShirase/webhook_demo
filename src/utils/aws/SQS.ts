import * as AWS from 'aws-sdk';

AWS.config.apiVersions = {
  sqs: '2012-11-05',
};
AWS.config.region = 'us-east-1';
const sqs = new AWS.SQS();

export const sendMessage = async (params: any): Promise<any> =>
  sqs.sendMessage(params).promise();

export const deleteMessage = async (params: any): Promise<any> =>
  sqs.deleteMessage(params).promise();
