'use strict'
const qs = require('querystring');
const clipboardy = require('clipboardy');
const chalk = require('chalk');
const debounce =  require('lodash.debounce');
const getImgString = require('img-term-string')

const checkTermSupport = require('./checkTerm.js');
const get = require('./get.js');

function logErrorAndExit(err) {
    const errMsg = err instanceof Error ? err.toString() : `Error: ${JSON.stringify(err)}`
    console.log(chalk`{yellowBright ${errMsg}}`);
    process.exit();
}

const BASE_URL = 'https://api.giphy.com/v1'
const PUBLIC_API_KEY = '3eFQvabDx69SMoOemSP iYfh9FY0nzO9x';
const GIPHY_API_KEY = process.env.GIPHY_API_KEY || PUBLIC_API_KEY;

function getApiUrl({text, lib, endpoint, page }) {
    const params = { api_key: GIPHY_API_KEY };
    if(endpoint === 'translate') {
        params.s = text;
    }
    if(endpoint === 'search') {
        params.q = text;
        params.limit = 100;
        params.offset = params.limit * page;
    }
    return `${BASE_URL}/${lib}/${endpoint}?${qs.stringify(params)}`;
}


async function textToGif(text, { lib, endpoint, width, height }) {
    try {
        let { data } = await get(getApiUrl({ text, lib, endpoint} ));
        if (!data.id) return null;

        const src = data.images.fixed_height.url;        
        const imgStr = await getImgString({ src, width, height })
            
        return {  imgStr, ...cherryPick(data) };
        
    } catch (err) {
        logErrorAndExit(err);
    }
}


function parseOptions(text, opts) {
    const options = {};
    options.lib = (opts.sticker && text) ? 'stickers' : 'gifs';
    options.endpoint = (!text || opts.tv) ? 'search' : 'translate';

    options.width = opts.width || 'auto',
    options.height = opts.height || '200px';
    options.clip = opts.clip || false;

    return options;
}


function cherryPick(props) {
    return {
        username: props.username,
        title: props.title,
        slug: props.slug,
        url: props.images.fixed_height.url,
        width: props.images.fixed_height.width,
        height: props.images.fixed_height.height,
    }
}

async function main(text = '', options = {}) {
    checkTermSupport();
    options = parseOptions(text, options);
    
    const data = await textToGif(text, options)
    if (!data) {
        return logErrorAndExit('oops! input is invalid')
    }
    console.log(data.imgStr);
    options.clip && clipboardy.writeSync(data.url);
};


function data(text = '', options = {}) {
    checkTermSupport();
    options = parseOptions(text, options);
    return textToGif(text, options);
};

function tv(text, options) {
    checkTermSupport();
    options = parseOptions(text, options); 

    const { lib, endpoint, width, height } = options;
    
    let page = 0;
    let index = 0;
    let data;

    async function init(text, pg = 0) {
        page = pg;
        index = 0;
        const apiUrl = getApiUrl({ text, lib, endpoint, page });
        let resp = await get(apiUrl);
        data = resp.data.length > 0 ? resp.data : null;
    }
    
    async function next() {
        if (!data) {
            return null;
        }
        if (index === data.length - 1) {
            page++;
            await init(text, page);
        }
        index++;
        const src = data[index].images.fixed_height.url;
        const imgStr = await getImgString({ src, width, height });
        return { imgStr, ...cherryPick(data[index]) };
    }

    return { next, init };
}

module.exports = main;
module.exports.data = data;
module.exports.tv = tv;

// used only internally for tests
module.exports._ = { getApiUrl };