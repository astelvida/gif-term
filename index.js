// 'use strict'
const fs = require('fs');
const path= require('path');
const qs = require('querystring');
const clipboardy = require('clipboardy');
const pify = require('pify');

const checkTermSupport = require('./checkTerm.js');
const get = require('./get.js');

const BASE_URL = 'https://api.giphy.com/v1'
const PUBLIC_API_KEY = '3eFQvabDx69SMoOemSPiYfh9FY0nzO9x';
const GIPHY_API_KEY = process.env.GIPHY_API_KEY || PUBLIC_API_KEY;

function getApiUrl(text, { lib, endpoint }) {
    text = text || 'timelapse';
    let params = {};

    switch (endpoint) {
        case 'translate':
            params = { s: text };
            break;
        case 'search':
            const limit = 50;
            const offset = Math.floor(Math.random() * limit);
            params = { q: text, limit, offset };
            break;
        default: 
            console.error(`${endpoint} does not exist`);
            process.exit();
    }
    params.api_key = GIPHY_API_KEY;

    return `${BASE_URL}/${lib}/${endpoint}?${qs.stringify(params)}`;
}

function getImgString(buffer, { width, height }) {    
    const imgOptions = Object
        .entries({ inline: '1', height, width })
        .map(([k, v]) => `${k}=${v}`)
        .join(';');

    return '\u001b]1337;File=' + imgOptions + ':' + buffer.toString('base64') + '\u0007';
}

async function textToGif(text, options) {
    try {
        const apiUrl = getApiUrl(text, options);
        const { data } = await get(apiUrl);

        const gifObj = Array.isArray(data) ? data[0] : data;

        if (!gifObj) {
            const imgBufferAlt = fs.readFileSync('./no-gif-meme.gif');
            console.log(getImgString(imgBufferAlt, options));
            process.exit();
        }
        
        const imgBuffer = await get.img(gifObj.images.original.url);
        
        options.clip && clipboardy.writeSync(gifObj.images.original.url);
        options.save &&  pify(fs.writeFile)(options.save, imgBuffer);
        
        return getImgString(imgBuffer, options);
    } catch (err) {
        console.error(err);
    }
}

 async function main(text = '', opts = {}) {
    try {
        checkTermSupport();
            
        const options = {};
        options.lib = (opts.stickers && text) ? 'stickers' : 'gifs';
        options.endpoint = !text ? 'search' : 'translate';
        options.width = opts.width || 'auto',
        options.height = options.width !== 'auto' ? 'auto' : (opts.height || '200px');
        
        if (opts.save === true) {
            const fileName = text ? `${text.replace(/[\W]+/g, '')}.gif` : 'lucky.gif';
            options.save = path.resolve(fileName);
    
        } else if (options.save && typeof opts.save === 'string') {
            let { name } = path.parse(opts.save);
            options.save = path.resolve(`${name}.gif`)
        }
        
        const termGif = await textToGif(text, options);

        (opts.log !== false) && console.log(termGif);

        return termGif;
    } catch(err) {
        console.error(err);
    }
};

module.exports = main;

// used only internally for tests
module.exports._ = { getApiUrl, getImgString };


