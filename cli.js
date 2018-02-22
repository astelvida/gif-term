#!/usr/bin/env node
'use strict';
const path = require('path');

const meow = require('meow');
const chalk = require('chalk');
const iterm2Version = require('iterm2-version');

const textToGif = require('./index.js');

const cli = meow(
    `
        Express yourself with gifs from text on the command line

        Usage
        $  gifcat <text> - translate text to gif (random gif if no text)
    
        Options
        --clip              Copy link to clipboard
        --sticker           Get a sticker gif
        --file [filePath]   Save locally to file [Default: <text>.gif]
        --size [npx|n%|n]   Set image size in based on height [Default: 200px]

        Examples
        $ gifcat 'psychedelic pizza'
        $ gifcat 'facepalm' --clip --file
        $ gifcat 'can you tell' --file=./icantell.gif
        $ gifcat 'omg' --sticker --size=50%
    `,
    {
        flags: {
            clip: {
                type: 'boolean',
                default: false,
            },
            sticker: {
                type: 'boolean',
                default: false
            },
            size: {
                type: 'string',
                default: '200px'
            },
            file: {
                type: 'string',
                default: null
            }
        }
    }
);


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
    const endpoint = text ? 'translate' : 'random';
    
    let localPath = null;
    if (file !== null) {
        const { name, ext, dir } = path.parse(file);
        const fileName = file === '' ? 
            `${text ? text.replace(/[\W]+/g, '') : 'random'}.gif` :
            `${name}${ext || '.gif'}`;
        localPath = path.resolve(dir, fileName);
    }

    const options = { service, endpoint, localPath, clip, size };

    console.log('Options', options);
    textToGif(text, options);
}


main(cli.input[0], cli.flags);
