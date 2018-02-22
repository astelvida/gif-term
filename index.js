const fs = require('fs');
const querystring = require('querystring');
const clipboardy = require('clipboardy');

const get = require('./get.js');

const { log } = console;

const BASE_URL = 'https://api.giphy.com/v1';
const PUBLIC_GIPHY_API_KEY = '3eFQvabDx69SMoOemSPiYfh9FY0nzO9x';
const GIPHY_API_KEY = process.env.GIPHY_API_KEY || PUBLIC_GIPHY_API_KEY;

const queryMap = {
    translate: 's',
    random: 'tag',
};

function getUrl(text, service, endpoint) {
    const requestParams = querystring.stringify({ 
        api_key: GIPHY_API_KEY,
        [queryMap[endpoint]]: text,
    });

    return `${BASE_URL}/${service}/${endpoint}?${requestParams}`;
}

function showGifInTerm(imgBuff, height) {
    log('\033]1337;File=inline=1;' + 'height=' + height + ':' + imgBuff.toString('base64') + '\u0007');
}

async function textToGif(text, options) {
    console.log(options);
    const requestUrl = getUrl(text, options.service, options.endpoint);

    const { data } = await get(requestUrl);
    
    if (!data.images) {
        const image = fs.readFileSync('./no_data_meme.gif');
        showGifInTerm(image, options.size);
        return;        
    }
    
    const imgBuffer = await get(data.images.original.url);

    if (options.clip) {
        clipboardy.writeSync(data.images.original.url);        
    }

    if (options.localPath) {
        fs.writeFile(options.localPath, imgBuffer, (err) => 
            err ? log(err.message) : true
        );
    }

    showGifInTerm(imgBuffer, options.size);
}

module.exports = textToGif;