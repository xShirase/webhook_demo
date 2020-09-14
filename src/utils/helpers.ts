import { prepareEvent, sendEvents } from './aws/EventBridge'
import axios from 'axios';
import { EVENT_RETRY, EVENT_CRITICAL, EVENT_SUCCESS } from '../constants'

export const makeErrorEvent = (error: any, event: any) => {
    // TODO Should use a proper logger, but below is enough for Cloudwatch debug based on id
    console.log(event.id);
    console.log(JSON.stringify(error))
    const originalRequestId = event.id
    const maxRetries = parseInt(process.env.backoffMaxRetries || '3', 10)

    if ((error.response || error.request)) {
        // We sent a request, or received an error response, let's retry
        return prepareEvent(
            JSON.stringify({ ...event.detail, originalRequestId }),
            EVENT_RETRY,
            'webhook-api')
    } else {
        // Something else happened, let's not retry
        return prepareEvent(
            JSON.stringify({ originalRequestId }),
            EVENT_CRITICAL,
            'webhook-api')
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
    return t < 900 ? t : 900
}

export const requestBills = async (event) => {
    const { provider, callbackUrl } = event.detail;
    const { providerBasePath } = process.env;
    const res = await axios.get(`${providerBasePath}${provider}`)
    const originalRequestId = event.id
    const successEvent = prepareEvent(
        JSON.stringify({ originalRequestId, bills: res.data }),
        EVENT_SUCCESS,
        'webhook-api'
    )
    await sendEvents([successEvent])
}