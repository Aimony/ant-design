const chalk = require('chalk');
const $ = require('dekko');

$('dist')
  .isDirectory()
  .hasFile('antd-with-locales.js')
  .hasFile('antd-with-locales.js.map')
  .hasFile('antd-with-locales.min.js')
  .hasFile('antd-with-locales.min.js.map')
  .hasFile('antd.js')
  .hasFile('antd.js.map')
  .hasFile('antd.min.js')
  .hasFile('antd.min.js.map')
  .hasFile('reset.css');

console.log(chalk.green('✨ `dist` directory is valid.'));
