const axios = require('axios')

const awaitAll = (count, asyncFn) => {
    const promises = [];

    for (i = 0; i < count; ++i) {
        promises.push(asyncFn());
    }

    return Promise.all(promises);
}

const callAPI = async () => {
    return await axios.post(
        'https://yeotqau052.execute-api.us-east-1.amazonaws.com/dev/collect',
        { 'provider': 'internet', callbackUrl: 'https://webhook.site/7ec6c1ec-a59f-4657-8bdb-6b3c4cf94d1f' }
    )
}

console.log(callAPI())

// awaitAll(10000, callAPI)
//     .then(results => console.log(results))
//     .catch(e => console.error(e));


