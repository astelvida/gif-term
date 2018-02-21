const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const minimist = require('minimist');
const clipboardy = require('clipboardy');
const chalk = require('chalk');
const iterm2Version = require('iterm2-version');

const get = require('./get.js');
const gifParty = require('./gifParty.js');

const { log } = console;

const BASE_URL = 'https://api.giphy.com/v1';
const PUBLIC_GIPHY_API_KEY = '3eFQvabDx69SMoOemSPiYfh9FY0nzO9x';
const GIPHY_API_KEY = process.env.GIPHY_API_KEY || PUBLIC_GIPHY_API_KEY;

const queryKeys = {
    'search': 'q',
    'translate': 's',
    'random': 'tag',
}

function url(text, service, endpoint) {
    const requestParams = { 
        api_key: GIPHY_API_KEY,
        [queryKeys[endpoint]]: text,
    };
    return `${BASE_URL}/${service}/${endpoint}?${querystring.stringify(requestParams)}`;
}


async function textToGif(text, options) {
    const apiUrl = url(text, options.service, options.endpoint);
    const { data } = await get(apiUrl);

    let imgBuffer;
    if (options.endpoint === 'search') {
        const urls = data.map(entry => entry.images.original.url);
        // console.log('DATA', data.map(({ images: { original : { width, height } }}) => width / height).sort());
        imgBuffer = await gifParty(`${text.replace(/[\W]+/g, '')}.gif`, urls);

    } else {
        const { images: { fixed_height: { url } }, title } = data;
        imgBuffer = await get(url);
        if (options.clip) {
            clipboardy.writeSync(url);        
        }
    }
    
    if (options.localPath) {
        fs.writeFile(options.localPath, imgBuffer, (err) => err ? 
            log(chalk`{red.bold Error:} ${JSON.stringify(err.message)}`) :
            log(chalk.green(`Saved file at ${chalk.blue.bold(options.localPath)}`))
        );
    }
    log('\033]1337;File=inline=1;height=' + options.size + ':' + imgBuffer.toString('base64') + '\u0007');
}

function handleTerminalError(message) {
    log(
        chalk.yellow.bold(message) + 
        ' is not supported. Please install the latest stable release of '+
        chalk.green.bold('iTerm2 - ') + 
        chalk.green.underline('https://www.iterm2.com/downloads.html')
    );
    process.exit();
}

function main(text, flags) {

    const { TERM_PROGRAM } = process.env;

    if (TERM_PROGRAM !== 'iTerm.app') {
        handleTerminalError(`${TERM_PROGRAM}`);
    }
    
    const version = iterm2Version();
    if ( TERM_PROGRAM === 'iTerm.app' && Number(version.charAt(0)) < 3) {
        handleTerminalError(`iTerm2@${version}`);
    }

    const { sticker, party, file, clip, size } = flags;

    const service = sticker ? 'stickers' : 'gifs';
    const endpoint = party ? 'search' : text ? 'translate' : 'random';
    
    let localPath = null;
    if (file !== null) {
        const { name, ext, dir } = path.parse(file);
        const fileName = file === '' ? 
            `${text ? text.replace(/[\W]+/g, '') : 'random'}.gif` :
            `${name}${ext || '.gif'}`;
        localPath = path.resolve(dir, fileName);
    }
    
    textToGif(text, { service, endpoint, localPath, clip, size });
}

module.exports = main;