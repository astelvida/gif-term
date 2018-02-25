const https = require('https');
const concat = require('concat-stream');

const makeGetRequest = f => url =>
    new Promise(resolve =>
        https.get(url, resp => 
            resp.pipe(
                concat(body => resolve(f(body)))
            )
        )
    );

module.exports = makeGetRequest(buf => JSON.parse(buf));
module.exports.img = makeGetRequest(buf => buf);