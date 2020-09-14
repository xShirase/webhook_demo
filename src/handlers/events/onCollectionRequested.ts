import middy from '@middy/core';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop'
import { makeErrorEvent, requestBills, makeRetryMessage } from '../../utils/axios'
import { EVENT_RETRY, EVENT_CRITICAL, EVENT_SUCCESS } from '../../constants'
import { sendMessage } from '../../utils/aws/SQS'
import { sendEvents } from '../../utils/aws/EventBridge'


export const onCollectionRequested = async (event: any) => {
  event.detail.attempts = 1;

  try {
    await requestBills(event);
    return;
  } catch (err) {
    const errorEvent = makeErrorEvent(err, event);
    console.log(errorEvent);

    if (errorEvent.DetailType === EVENT_RETRY) {
      const retryMessage = makeRetryMessage(errorEvent);
      console.log(retryMessage);
      const sqsRes = await sendMessage(retryMessage);
      console.log(sqsRes);
    }

    await sendEvents([errorEvent]);
    return;
  };
}

export const handler = middy(onCollectionRequested)
  .use(
    doNotWaitForEmptyEventLoop({
      runOnBefore: true,
      runOnAfter: true,
      runOnError: true,
    }));
// .use(validator({ inputSchema }));
