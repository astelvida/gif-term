const https = require('https');

function get(url) {
    return new Promise((res, rej) => {
        https.get(url, resp => {
            switch (resp.headers['content-type']) {
                case 'image/gif': {
                    const data = [];
                    resp.on('data', chunk => {
                        data.push(Buffer.from(chunk));
                    });
                    resp.on('end', () => {
                        res(Buffer.concat(data));
                    });
                    break;
                }

                case 'application/json':
                default: {
                    let body = '';
                    resp.on('data', chunk => {
                        body += chunk;
                    });
                    resp.on('end', () => {
                        res(JSON.parse(body));
                    });
                    break;
                }
            }
        })
        .on('error', err => {
            console.error(err);
            rej(err)
        });
    });
}

module.exports = get;