import { EventBridge } from 'aws-sdk';
import { PutEventsRequestEntry } from 'aws-sdk/clients/eventbridge';
import { PutEventsResponse } from 'aws-sdk/clients/cloudwatchevents';

export const eventBridge = new EventBridge({
    apiVersion: '2015-10-07',
    region: 'us-east-1',
});

export const sendEvents = async (Entries: PutEventsRequestEntry[]): Promise<PutEventsResponse> =>
    eventBridge.putEvents({ Entries }).promise();

export const prepareEvent = (item: string, type: string, source: string): PutEventsRequestEntry => ({
    EventBusName: process.env.eventBus,
    Source: source,
    DetailType: type,
    Detail: item,
});
