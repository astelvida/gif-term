const fs = require('fs');
const GIFEncoder = require('gifencoder');
const Canvas = require('canvas');
const termImg = require('term-img');

const get = require('./get');

const HEIGHT = 300;
const WIDTH = 300;

async function draw(file = 'party.gif', urls) {
    const encoder = new GIFEncoder(WIDTH, HEIGHT);
    const writeStream = fs.createWriteStream(file);
    const readStream = encoder.createReadStream();

    let body = [];
    readStream.on('data', chunk => {
        body.push(Buffer.from(chunk));
    });

    const bodyOnEndAsync = new Promise(
        res => readStream.on('end', () => res(Buffer.concat(body)))
    );
    
    readStream.pipe(writeStream);
    
    encoder.start();
    encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
    encoder.setDelay(100); // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.

    // use node-canvas
    var canvas = new Canvas(WIDTH, HEIGHT);
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#aa00ff';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.font = 'bold 40px Inconsolata';
    ctx.fillStyle = 'white';
    ctx.fillText(file, WIDTH/4, HEIGHT/4);
    encoder.addFrame(ctx);

    const images = await Promise.all(urls.map(get));
    images.forEach((image, i) => {
        img = new Canvas.Image();
        img.src = image;
        const scaleBy = img.width / WIDTH;
        ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
        ctx.font = 'bold 30px Inconsolata';
        ctx.fillStyle = 'magenta';
        // ctx.fillText(i + ': ' + scaleBy, 30, 30);
        encoder.addFrame(ctx);
    });

    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.font = 'bold 40px Inconsolata';
    ctx.fillStyle = 'black';
    ctx.fillText(file, WIDTH/4, HEIGHT/4);
    encoder.addFrame(ctx);

    encoder.finish();

    return bodyOnEndAsync;

}

module.exports = draw;