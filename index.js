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
const GIPHY_API_KEY = '3eFQvabDx69SMoOemSPiYfh9FY0nzO9x';

function getApiUrl({ text, lib, endpoint, page }) {
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
        const apiUrl = getApiUrl({ text, lib, endpoint });
        const { data } = await get(apiUrl);
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
    try {
        checkTermSupport();
        options = parseOptions(text, options);
        
        const data = await textToGif(text, options)
        if (!data) logErrorAndExit('oops! input is invalid');
    
        console.log(data.imgStr);
        options.clip && clipboardy.writeSync(data.url);
        
    } catch (err) {
        logErrorAndExit(err);
    }
};


function data(text = '', options = {}) {
    try {
        checkTermSupport();
        options = parseOptions(text, options);
        return textToGif(text, options);

    } catch (err) {
        logErrorAndExit(err);
    }
};

main("mind blown", { height: '50%', clip: true });

module.exports = main;
module.exports.data = data;

// used only internally for tests
module.exports._ = { getApiUrl };