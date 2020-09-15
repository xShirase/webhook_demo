import {
  makeEvent,
  makeErrorEvent,
  makeRetryMessage,
  computeBackoff,
  requestBills,
  handleProviderError
} from '../../src/utils/helpers';
import { EVENT_RETRY, EVENT_CRITICAL, EVENT_SUCCESS, EVENT_MAXRETRY } from '../../src/constants';


describe('Given a makeEvent function', () => {
  it('should return the correct event', () => {
    process.env.eventBus = 'fakebus'
    const EXPECTED = {
      Detail: "{\"a\":\"body\"}",
      DetailType: "Type",
      EventBusName: 'fakebus',
      Source: "webhook-api"
    };

    expect(makeEvent('Type', { a: 'body' })).toStrictEqual(EXPECTED);
  });

});

describe('Given a makeErrorEvent function', () => {

  beforeEach(() => {
    process.env.eventBus = 'fakebus';
    process.env.backoffMaxRetries = '2';
  });

  describe('When we have a req or response from axios', () => {

    describe('and have retries left', () => {
      it('should return an EVENT_RETRY', () => {

        const inputEvent = {
          id: '123456',
          detail: {
            a: 'property',
            attempts: 1
          }
        }

        const error = {
          response: { a: 'Server error' },
        }



        const EXPECTED = {
          Detail: "{\"a\":\"property\",\"attempts\":1,\"originalRequestId\":\"123456\"}",
          DetailType: EVENT_RETRY,
          EventBusName: "fakebus",
          Source: "webhook-api",
        }

        const output = makeErrorEvent(error, inputEvent)
        expect(output).toEqual(EXPECTED);
      });
    });

    describe('and have no retries left', () => {
      it('should return an EVENT_MAXRETRY', () => {

        const inputEvent = {
          id: '123456',
          detail: {
            a: 'property',
            attempts: 2
          }
        }

        const error = {
          response: { a: 'Server error' },
        }



        const EXPECTED = {
          Detail: "{\"a\":\"property\",\"attempts\":2,\"originalRequestId\":\"123456\"}",
          DetailType: EVENT_MAXRETRY,
          EventBusName: "fakebus",
          Source: "webhook-api",
        }

        const output = makeErrorEvent(error, inputEvent)
        expect(output).toEqual(EXPECTED);
      });
    });
  });

  describe('When we have no req or response from axios', () => {
    it('should return an EVENT_CRITICAL', () => {

      const inputEvent = {
        id: '123456',
        detail: {
          a: 'property',
          attempts: 1
        }
      }

      const error = {}

      const EXPECTED = {
        Detail: "{\"originalRequestId\":\"123456\"}",
        DetailType: EVENT_CRITICAL,
        EventBusName: "fakebus",
        Source: "webhook-api",
      }

      const output = makeErrorEvent(error, inputEvent)
      expect(output).toEqual(EXPECTED);
    });
  });
});

describe('Given a computeBackoff function and an event', () => {

  beforeEach(() => {
    process.env.eventBus = 'fakebus';
    process.env.backoffIntervalSeconds = '2';
    process.env.backoffRate = '2';
  });

  describe('When backoff timeout < 900', () => {
    it('should compute the right backoff', () => {
      const inputEvent = {
        id: '123456',
        detail: {
          a: 'property',
          attempts: 2
        }
      }
      const EXPECTED = 8; // 2 * Math.pow(2, 2)
      const output = computeBackoff(inputEvent);
      expect(output).toStrictEqual(EXPECTED);
    });
  });

  describe('When backoff timeout > 900', () => {
    it('should compute the right backoff', () => {
      const inputEvent = {
        id: '123456',
        detail: {
          a: 'property',
          attempts: 2000
        }
      }
      const EXPECTED = 900
      const output = computeBackoff(inputEvent);
      expect(output).toStrictEqual(EXPECTED);
    });
  });
});


describe('Given a makeRetryMessage function and an event', () => {

  beforeEach(() => {
    process.env.eventBus = 'fakebus';
    process.env.backoffIntervalSeconds = '2';
    process.env.backoffRate = '2';
    process.env.retryQueue = 'testqueue'
  });

  it('should return an SQS SendMessageRequest', () => {
    const inputEvent = {
      id: '123456',
      detail: {
        a: 'property',
        attempts: 1
      }
    }

    const EXPECTED = {
      DelaySeconds: 4,
      MessageBody: "{\"id\":\"123456\",\"detail\":{\"a\":\"property\",\"attempts\":1}}",
      QueueUrl: "testqueue",
    }

    const output = makeRetryMessage(inputEvent);
    expect(output).toStrictEqual(EXPECTED)
  });
});
