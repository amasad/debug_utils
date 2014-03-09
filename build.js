var fs = require('fs');
var util = require('util');

var code = fs.readFileSync(__dirname + '/du.js').toString();
fs.writeFileSync(
  'devtools.js',
  'chrome.devtools.inspectedWindow.eval(JSON.parse(' +
    util.inspect(JSON.stringify(code)) + '));'
);
