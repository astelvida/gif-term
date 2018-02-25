import test from 'ava';
import { _ }  from './index.js';

const text = 'taco';
const options = { // parsed options
    lib: 'gifs',
    endpoint: 'translate',
    width: 'auto',
    height: '20%',
}
const buffer = new Buffer('etc');

test('`getApiUrl` should use the stickers and endpoint provided in options', t => {
    const url = _.getApiUrl(text, options);

    t.true(url.includes(`/${options.lib}/${options.endpoint}`));
});

test('`getApiUrl` should map the `translate` endpoint to the `s` query param key', t => {
    const urlTranslate = _.getApiUrl(text, options);

    t.true(urlTranslate.includes(`s=${text}`));
});

test('the `search` endpoint should have the correct query key and the limit and offset keys', t => {
    const urlSearch = _.getApiUrl(text, { ...options, endpoint: 'search' });
    
    t.true(urlSearch.includes(`q=${text}`));
    t.true(urlSearch.includes(`offset=`));      
    t.true(urlSearch.includes(`limit=`));            
});

test('`getImgString` should return a string', t => {
    const imgString = _.getImgString(buffer, options);
    
    t.true(typeof imgString === 'string');
});

test('`getImgString` should use the width and height provided', t => {
    const imgString = _.getImgString(buffer, options);

    t.true(imgString.includes(options.width));
    t.true(imgString.includes(options.height));
});