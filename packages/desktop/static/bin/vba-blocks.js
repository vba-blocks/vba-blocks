const { resolve } = require('path');
const archive = resolve('../resources/app.asar');

require(`${archive}/node_modules/vba-blocks/bin/vba-blocks`);
