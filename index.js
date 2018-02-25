'use strict'
const fs = require('fs');
const readline= require('readline');
const path= require('path');
const qs = require('querystring');
const clipboardy = require('clipboardy');
const chalk = require('chalk');

const checkTermSupport = require('./checkTerm.js');
const get = require('./get.js');

const { log } = console;
const savePos = () => process.stdout.write('\u001B[s');
const restorePos = () => process.stdout.write('\u001B[u');

function logErrorAndExit(err) {
    restorePos();
    readline.clearScreenDown(process.stdout);
    log(chalk`{yellowBright ${err.name}: ${err.message}}`);
    process.exit();
}

function showRainAndExit(message) {
    message = message || 'No gif found. Try changing your input.'
    const rainGif = fs.readFileSync('./rain.gif');
    restorePos();
    readline.clearScreenDown(process.stdout);
    log(getImgString(rainGif, { width: 'auto', height: 5 }));
    savePos();
    readline.moveCursor(process.stdout, 8, -3);
    log(chalk`{yellow.bold ${message}}  `);
    restorePos();
    process.exit();
}

function showCoolCat(message='') {
    const spinner = fs.readFileSync('./cool_cat.gif');
    const spinnerOpts = { height: 3, width: 8};
    savePos();
    log(getImgString(spinner, { height: 3, width: 8}));
    readline.moveCursor(process.stdout, 6, -2);
    log(chalk`{cyan.bold ${`Translating "${message}" to gif...`}}`);
}

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
            log(`The ${endpoint} API endpoint doesn\'t exist.'`);
    }
    params.api_key = GIPHY_API_KEY;

    return `${BASE_URL}/${lib}/${endpoint}?${qs.stringify(params)}`;
}

function getImgString(buffer, { width = 'auto', height = 'auto' }) {    
    const imgOptions = Object
        .entries({ inline: '1', height, width })
        .map(([k, v]) => `${k}=${v}`)
        .join(';');

    return '\u001B]1337;File=' + imgOptions + ':' + buffer.toString('base64') + '\u0007';
}

async function textToGif(text, options) {
    try {
        const apiUrl = getApiUrl(text, options);
        const { data } = await get(apiUrl);

        const gifObj = Array.isArray(data) ? data[0] : data;

        if (!gifObj) {
            showRainAndExit();
        }
        
        const imgBuffer = await get.img(gifObj.images.original.url);
        
        options.clip && clipboardy.writeSync(gifObj.images.original.url);
        options.save && fs.writeFile(options.save, imgBuffer, logErrorAndExit);
        
        return getImgString(imgBuffer, options);
    } catch (err) {
        logErrorAndExit(err.message);
    }
}

 async function main(text = '', opts = {}) {
    try {
        checkTermSupport();
        showCoolCat(text);

        const options = {};
        options.lib = (opts.stickers && text) ? 'stickers' : 'gifs';
        options.endpoint = !text ? 'search' : 'translate';
        options.width = opts.width || 'auto',
        options.height = opts.height || '250px';
        options.log = opts.log === false ? false : true;

        if (opts.save === true) {
            const fileName = text ? `${text.replace(/[\W]+/g, '')}.gif` : 'lucky.gif';
            options.save = path.resolve(fileName);
    
        } else if (options.save && typeof opts.save === 'string') {
            let { name } = path.parse(opts.save);
            options.save = path.resolve(`${name}.gif`)
        }

        const termGif = await textToGif(text, options);

        restorePos();
        readline.clearScreenDown(process.stdout);

        if (options.log !== false) {
            log(termGif);
        }

        return termGif;
    } catch(err) {
        logErrorAndExit(err);
    }
};

main();

module.exports = main;

// used only internally for tests
module.exports._ = { getApiUrl, getImgString };


