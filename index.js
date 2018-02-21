const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const minimist = require('minimist');
const clipboardy = require('clipboardy');
const chalk = require('chalk');
const iterm2Version = require('iterm2-version');

const get = require('./get.js');

const BASE_URL = 'https://api.giphy.com/v1';
const PUBLIC_GIPHY_API_KEY = '3eFQvabDx69SMoOemSPiYfh9FY0nzO9x';
const GIPHY_API_KEY = process.env.GIPHY_API_KEY || PUBLIC_GIPHY_API_KEY;

function url(text, isSticker) {
    const urlPath = `${isSticker ? 'stickers' : 'gifs'}/${text ? 'translate' : 'random'}`;
    const requestParams = { api_key: GIPHY_API_KEY };
    if (text) {
        requestParams.s = text;
    }

    return `${BASE_URL}/${urlPath}?${querystring.stringify(requestParams)}`;
}


function logError(err) {
    console.log(chalk.hex('#FF5252')(`${err.message}`));
}


function textToGif(text, options) {
    const apiUrl = url(text, options.sticker);
    
    get(apiUrl)
        .then(resp => {
            const { url } = resp.data.images.fixed_height;
            if (options.copy) {
                clipboardy.writeSync(url);
            }
            return get(url);
        })
        .then(imgBuffer => {
            if (options.file !== null) {
                const { name, ext, dir } = path.parse(options.file);
                const fileName = options.file === '' ? 
                    `${text ? text.replace(/[\W]+/g, '') : 'random'}.gif` :
                    `${name}${ext || '.gif'}`;
                const filePath = path.resolve(dir, fileName);

                fs.writeFile(filePath, imgBuffer, (err) => {
                    if (err) {
                        return err.code === 'ENOENT' ? 
                            console.log(chalk.hex('#FFD740')(`Couldn't save image - no such path ${chalk.bold(filePath)}`)) : 
                            logError(err);
                    }
                    console.log(chalk.hex('#76FF03')(`Saved file at ${chalk.hex('#8C9EFF').bold(filePath)}`));
                });
            }

            console.log('\033]1337;File=inline=1;height=' + options.size + ':' + imgBuffer.toString('base64') + '\u0007')
        })
        .catch(logError);
}


function handleTerminalError(message) {
    console.log(
        chalk.yellow.bold(message) + 
        ' is not supported. Please install the latest stable release of '+
        chalk.green.bold('iTerm2 - ') + 
        chalk.underline('https://www.iterm2.com/downloads.html')
    );
    process.exit();
}

function main(text, options) {

    const { TERM_PROGRAM } = process.env;

    if (TERM_PROGRAM !== 'iTerm.app') {
        handleTerminalError(`${TERM_PROGRAM}`);
    }
    
    const version = iterm2Version();
    if ( TERM_PROGRAM === 'iTerm.app' && Number(version.charAt(0)) < 3) {
        handleTerminalError(`iTerm2@${version}`);
    }

    textToGif(text, options);
}

module.exports = main;