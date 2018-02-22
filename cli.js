#!/usr/bin/env node
'use strict';
const path = require('path');
const meow = require('meow');
const chalk = require('chalk');
const iterm2Version = require('iterm2-version');

const textToGif = require('./index.js');

const { log } = console;

const cli = meow(
    `
        Express yourself with gifs on the command line.

        Usage
        $  gifcat [<text>] - translate text to gif (random gif if no text)
    
        Options
        --sticker -s        Get a sticker (transparent) gif
        --roulette -r       Get a random(ish) gif limited by keyword/tag [<text>]
        --clip              Copy gif url to clipboard
        --file [filePath]   Save locally to file [Default: <text>.gif]
        --size [npx|n%|n]   Set gif height in pixels or relative to terminal [Default: 250px]

        Examples
        $ gifcat 'psychedelic pizza'
        $ gifcat 'bored taco' --roulette
        $ gifcat 'facepalm' --clip --file
        $ gifcat 'can you tell' --file=./icantell.gif
        $ gifcat 'omg' --sticker --size=50%
    `,
    {
        flags: {
            sticker: {
                type: 'boolean',
                default: false,
                alias: 's',
            },
            roulette: {
                type: 'boolean',
                default: false,
                alias: 'r',
            },
            clip: {
                type: 'boolean',
                default: false,
            },
            size: {
                type: 'string',
                default: '200px'
            },
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


function parseCliFlags(text, flags) {
    const options = { 
        size: flags.size,
        clip: flags.clip,
    };
    options.service = flags.sticker ? 'stickers' : 'gifs';
    options.endpoint = (!text || flags.roulette) ? 'random' : 'translate';
    
    if (flags.file) {
        let fileName;

        if (typeof flags.file === 'string') {
            const { ext, base } = path.parse(file);
            fileName = ext ? base : `${base}.gif`;
        } else {
            fileName = `${text ? text.replace(/[\W]+/g, '') : 'random'}.gif`;
        }

        options.localPath = path.resolve(path.dirname(fileName), fileName);
    }

    return options;
}


function main(text, options) {
    const { TERM_PROGRAM } = process.env;

    if (TERM_PROGRAM !== 'iTerm.app') {
        handleTerminalError(TERM_PROGRAM);
    }

    const termVersion = iterm2Version();
    if ( TERM_PROGRAM === 'iTerm.app' && Number(termVersion.charAt(0)) < 3) {
        handleTerminalError(`iTerm2@${termVersion}`);
    }
    
    textToGif(text, options);
}


const options = parseCliFlags(cli.input[0], cli.flags);

main(cli.input[0], options);