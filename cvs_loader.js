var fs = require('fs');

module.exports = function (file ) {
  var file = fs.readFileSync(file,'utf8');
  var ret = [];
  var lines = file.split(/[\r\n]+/);
  var header = lines.shift().split(',');
  return lines.filter(Boolean).map(function( line ) {
    var ret = {};
    var match = line.match(/(\"([^\"]+)\"|[^\,]+|)\,?/g);
    header.forEach(function( key, idx ) {
      ret[key] = match[idx].replace(/"|,$/g,'');
    });
    return ret;
  });
}