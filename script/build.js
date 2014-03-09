var fs = require('fs');
var util = require('util');

var pre = 'function inject() {\n';
var post = [
'',
'}',
'chrome.devtools.network.onNavigated.addListener(inject);',
'inject();'
].join('\n');

var code = fs.readFileSync(__dirname + '/../du.js').toString();
fs.writeFileSync(
  __dirname + '/../ext/devtools.js',
  pre + '\tchrome.devtools.inspectedWindow.eval(JSON.parse(' +
    util.inspect(JSON.stringify(code)) + '));' + post
);
