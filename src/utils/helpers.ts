import { prepareEvent, sendEvents } from './aws/EventBridge';
import { sendMessage } from './aws/SQS';
import axios from 'axios';
import { EVENT_RETRY, EVENT_CRITICAL, EVENT_SUCCESS, EVENT_MAXRETRY, EVENT_CALLBACK } from '../constants';
import { SendMessageRequest } from 'aws-sdk/clients/sqs';
import { EventBridge } from 'aws-sdk';



export const makeEvent = (type: string, body: any) => prepareEvent(
  JSON.stringify(body),
  type,
  'webhook-api');

export const makeErrorEvent = (error: any, event: any): EventBridge.PutEventsRequestEntry => {
  // TODO Maybe use a proper logger, but below is enough for Cloudwatch debug based on id + faster
  console.log(error.message);

  const originalRequestId = event.id;
  const maxRetries = parseInt(process.env.backoffMaxRetries || '3', 10);

  const shouldRetry = event.detail.attempts < maxRetries;
  const canCommunicate = error.response || error.request;

  if (canCommunicate && shouldRetry) {
    return makeEvent(EVENT_RETRY, { ...event.detail, originalRequestId });
  } else if (canCommunicate && !shouldRetry) {
    return makeEvent(EVENT_MAXRETRY, { ...event.detail, originalRequestId });
  } else {
    return makeEvent(EVENT_CRITICAL, { originalRequestId });
  }
};

export const makeRetryMessage = (event: EventBridge.PutEventsRequestEntry): SendMessageRequest => ({
  MessageBody: JSON.stringify(event),
  DelaySeconds: computeBackoff(JSON.parse(event.Detail || '')),
  QueueUrl: process.env.retryQueue || '',
});

export const computeBackoff = (detail): number => {
  const interval = parseInt(process.env.backoffIntervalSeconds || '5', 10);
  const rate = parseFloat(process.env.backoffRate || '1.5');
  const t = interval * Math.pow(rate, detail.attempts || 0);
  return t < 900 ? t : 900; // Hard limit
};

export const requestBills = async (event): Promise<void> => {
  const { provider, callbackUrl } = event.detail;
  const { providerBasePath } = process.env;
  const res = await axios.get(`${providerBasePath}${provider}`);
  const originalRequestId = event.id;
  const successEvent = makeEvent(EVENT_SUCCESS, { originalRequestId, callbackUrl, bills: res.data });
  await sendEvents([successEvent]);
};

export const handleProviderError = async (err: any, event: any): Promise<void> => {
  const errorEvent = makeErrorEvent(err, event);
  // TODO remove logs
  // console.log(errorEvent);

  if (errorEvent.DetailType === EVENT_RETRY) {
    const retryMessage = makeRetryMessage(errorEvent);
    // console.log(retryMessage);
    const sqsRes = await sendMessage(retryMessage);
    // console.log(sqsRes);
  }
  await sendEvents([errorEvent]);
};

export const callHook = async (event): Promise<void> => {
  const { callbackUrl } = event.detail;
  await axios.post(callbackUrl, event.detail);
  // makeEvent(EVENT_CALLBACK, { ...event.detail, originalRequestId });
};
