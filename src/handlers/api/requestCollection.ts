import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler'
import { sendEvents, prepareEvent } from '../../utils/aws/EventBridge'
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop'

export const requestCollectionHandler = async (event: any) => {
  // TODO check error handler 
  // throw new Error("error");
  const evt = prepareEvent(
    event.body,
    'CollectionRequested',
    'webhook-api');

  const res = await sendEvents([evt]);

  return {
    statusCode: 200,
    body: `Request Id: ${res.Entries[0].EventId}`
  };
}

export const handler = middy(requestCollectionHandler)
  .use(
    doNotWaitForEmptyEventLoop({
      runOnBefore: true,
      runOnAfter: true,
      runOnError: true,
    }))
  .use(httpErrorHandler());
