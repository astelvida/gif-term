const fs = require('fs');
const GIFEncoder = require('gifencoder');
const Canvas = require('canvas');
const termImg = require('term-img');

const get = require('./get');

const WIDTH = 400;
const HEIGHT = 200;
const scaleBy = HEIGHT / 200;

async function draw(file, urls) {
    const encoder = new GIFEncoder(WIDTH, HEIGHT);

    encoder.start();
    encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
    encoder.setDelay(500); // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.

    // use node-canvas
    var canvas = new Canvas(WIDTH, HEIGHT);
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#aa00ff';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    encoder.addFrame(ctx);

    const images = await Promise.all(
        urls.map(url =>
            get(url)
                .then(image => {
                    img = new Canvas.Image();
                    img.src = image;
                    ctx.drawImage(img, 0, 0, WIDTH, (img.height * WIDTH) / img.width);
                    // console.log(img.width / img.height, WIDTH, (img.height * WIDTH) / img.width)
                    encoder.addFrame(ctx);
                    return Promise.resolve();
                })
            )
        );

    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.font = 'bold 40px Inconsolata';
    ctx.fillStyle = 'black';
    ctx.fillText(file, WIDTH/4, HEIGHT/4);
    encoder.addFrame(ctx);

    encoder.finish();

    return encoder.out.getData();
}

module.exports = draw;