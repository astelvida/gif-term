const chalk = require('chalk');
const iterm2Version = require('iterm2-version');

module.exports = function () {
    const handleUnsupportedTerminal = message => {
        console.log(chalk`{yellow.bold ${message}} is not supported. Please install the latest stable release of {green.bold iTerm2} - {green.underline https://www.iterm2.com/downloads.html}`);
        process.exit();
    }
    
    const { TERM_PROGRAM } = process.env;
    
    if (TERM_PROGRAM !== 'iTerm.app') {
        handleUnsupportedTerminal(TERM_PROGRAM);
    }

    const termVersion = iterm2Version();
    if ( TERM_PROGRAM === 'iTerm.app' && Number(termVersion.charAt(0)) < 3) {
        handleUnsupportedTerminal(`iTerm2@${termVersion}`);
    }
}