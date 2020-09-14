import * as providers from '../../assets/providers.json'
import middy from '@middy/core';

const FAILURE_PROBABILITY = 0.5;

export const getProvider = async (event: any) => {
    let res;
    if (Math.random() > 1 - FAILURE_PROBABILITY) {

        return {
            statusCode: 500,
            body: 'It is not working!'
        }
    }
    const bills = providers[event.pathParameters.name]

    res = bills
        ? { body: JSON.stringify(bills), statusCode: 200 }
        : { body: 'No Provider', statusCode: 404 }

    return res
}

export const handler = middy(getProvider)
