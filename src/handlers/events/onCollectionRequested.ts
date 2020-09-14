import middy from '@middy/core';
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop'
import { handleProviderError, requestBills } from '../../utils/helpers'


export const onCollectionRequested = async (event: any) => {
  event.detail.attempts = 1;

  try {
    await requestBills(event);
    return;
  } catch (err) {
    await handleProviderError(err, event);
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