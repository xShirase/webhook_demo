import { prepareEvent, sendEvents } from './aws/EventBridge'
import { sendMessage } from './aws/SQS'
import axios from 'axios';
import { EVENT_RETRY, EVENT_CRITICAL, EVENT_SUCCESS, EVENT_MAXRETRY } from '../constants'

const makeEvent = (type, body) => prepareEvent(
    JSON.stringify(body),
    type,
    'webhook-api');

export const makeErrorEvent = (error: any, event: any) => {
    // TODO Maybe use a proper logger, but below is enough for Cloudwatch debug based on id + faster
    console.log(JSON.stringify(error))

    const originalRequestId = event.id
    const maxRetries = parseInt(process.env.backoffMaxRetries || '3', 10)

    const shouldRetry = event.detail.attempts < maxRetries;
    const canCommunicate = error.response || error.request;

    if (canCommunicate && shouldRetry) {

        return makeEvent(EVENT_RETRY, { ...event.detail, originalRequestId })
    } else if (canCommunicate && !shouldRetry) {

        return makeEvent(EVENT_MAXRETRY, { ...event.detail, originalRequestId })
    } else {
        // Something else happened, let's not retry
        return makeEvent(EVENT_CRITICAL, { originalRequestId })
    }
}

export const makeRetryMessage = (event) => ({
    MessageBody: JSON.stringify(event),
    DelaySeconds: computeBackoff(event),
    QueueUrl: process.env.retryQueue || ''
})

export const computeBackoff = (event) => {
    const interval = parseInt(process.env.backoffIntervalSeconds || '5', 10)
    const rate = parseFloat(process.env.backoffRate || '1.5')
    const t = interval * Math.pow(rate, event.attempts || 0)
    return t < 900 ? t : 900 // Hard limit
}

export const requestBills = async (event) => {
    const { provider, callbackUrl } = event.detail;
    const { providerBasePath } = process.env;
    const res = await axios.get(`${providerBasePath}${provider}`);
    const originalRequestId = event.id;
    const successEvent = makeEvent(EVENT_SUCCESS, { originalRequestId, bills: res.data });
    await sendEvents([successEvent]);
}

export const handleProviderError = async (err, event) => {
    const errorEvent = makeErrorEvent(err, event);
    // TODO remove that 
    console.log(errorEvent);

    if (errorEvent.DetailType === EVENT_RETRY) {
        const retryMessage = makeRetryMessage(errorEvent);
        console.log(retryMessage);
        const sqsRes = await sendMessage(retryMessage);
        console.log(sqsRes);
    }
    await sendEvents([errorEvent]);
}