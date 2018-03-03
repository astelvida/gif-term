const https = require('https');
const concat = require('concat-stream');

const get = url =>
    new Promise(resolve =>
        https.get(url, resp => 
            resp.pipe(
                concat(body => resolve(JSON.parse(body)))
            )
        )
    );

module.exports = get;
