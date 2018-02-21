#!/usr/bin/env node
'use strict';

const meow = require('meow');
const textToGif = require('./index.js');

const cli = meow(
    `
            Express yourself with gifs from text on the command line

            Usage
            $  gif-term <text> - translate text to gif (random gif if no text)
        
            Options
            --copy -c           Copy link to clipboard
            --sticker           Get a sticker gif 
            --file [filePath]   Save locally to file [Default: <text>.gif]
            --size [npx|n%|n]   Set image size in based on height [Default: 200px]

            Examples
            $ gif-term 'psychedelic pizza'
            $ gif-term 'facepalm' -c --file
            $ gif-term 'can you tell' --file=./icantell.gif
            $ gif-term 'omg' --sticker --size=50%
        `,
    {
        flags: {
            copy: {
                type: 'boolean',
                default: false,
                alias: 'c'
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
// console.log(cli.input[0], cli.flags)
textToGif(cli.input[0], cli.flags);
