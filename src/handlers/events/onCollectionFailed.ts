import { sendEvents } from '../../utils/aws/EventBridge'
import { deleteMessage } from '../../utils/aws/SQS'
import { handleProviderError, requestBills } from '../../utils/helpers'


export const onCollectionFailed = async (event: any) => {
  const message = event.Records[0];
  const body = JSON.parse(message.body);
  const detail = JSON.parse(body.Detail);
  const baseEvent = {
    detail,
    id: detail.originalRequestId
  }
  baseEvent.detail.attempts += 1;

  try {
    const delRes = await deleteMessage({
      ReceiptHandle: message.receiptHandle,
      QueueUrl: process.env.retryQueue || ''
    });

    await requestBills(baseEvent)
    return;

  } catch (err) {
    await handleProviderError(err, baseEvent);
    return;
  };
}


export const handler = onCollectionFailed
// .use(validator({ inputSchema }));
