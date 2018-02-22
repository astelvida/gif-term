const fs = require('fs');
const querystring = require('querystring');

const clipboardy = require('clipboardy');
const chalk = require('chalk');

const get = require('./get.js');

const { log } = console;

const BASE_URL = 'https://api.giphy.com/v1';
const PUBLIC_GIPHY_API_KEY = '3eFQvabDx69SMoOemSPiYfh9FY0nzO9x';
const GIPHY_API_KEY = process.env.GIPHY_API_KEY || PUBLIC_GIPHY_API_KEY;

const queryKeys = {
    'translate': 's',
    'random': 'tag',
}

function buildUrl(text, service, endpoint) {
    const requestParams = { 
        api_key: GIPHY_API_KEY,
        [queryKeys[endpoint]]: text,
    };
    return `${BASE_URL}/${service}/${endpoint}?${querystring.stringify(requestParams)}`;
}


async function textToGif(text, options) {
    const requestUrl = buildUrl(text, options.service, options.endpoint);
    console.log(requestUrl)
    const response = await get(requestUrl);

    const { url } = response.data.images.original;
    const imgBuffer = await get(url);

    if (options.clip) {
        clipboardy.writeSync(url);        
    }

    if (options.localPath) {
        fs.writeFile(options.localPath, imgBuffer, (err) => err ? 
            log(chalk`{red.bold Error:} ${JSON.stringify(err.message)}`) :
            log(chalk.green(`Saved file at ${chalk.blue.bold(options.localPath)}`))
        );
    }
    log('\033]1337;File=inline=1' + ':' + imgBuffer.toString('base64') + '\u0007');
}

module.exports = textToGif;