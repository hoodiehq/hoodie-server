var dispatch = require('dispatch');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');

var plugins = require('../plugins');

/* jshint unused:false*/

module.exports = function (config) {
  var paths = Object.keys(config.plugins).map(function (id) {
    var name = id.replace(/^hoodie-plugin-/, '');
    return path.resolve(
      config.plugins[id].path, 'hoodie.' + name + '.js'
    );
  });

  var bufferToString = function (buf) {
    return buf.toString();
  };

  var readString = _.compose(bufferToString, function (filename) {
    return fs.readFileSync(filename);
  });

  var extensions = paths.filter(fs.existsSync).map(readString);
  var hoodie_path = path.resolve(
    __dirname, '../../node_modules/hoodie/dist/hoodie.js'
  );

  // if the user's project has defined a hoodie.js dependency,
  // then favour that over our own dependency.
  if (config.app.hoodie && config.app.hoodie.hoodiejs) {
    hoodie_path = path.resolve(config.project_dir, config.app.hoodie.hoodiejs);
    console.log('Loading alternative hoodie.js from %s', hoodie_path);
  }

  var base = readString(hoodie_path);
  var hoodiejs = base + extensions.join('\n');

  return dispatch({
    '/_api/_files/hoodie.js': function (req, res, next) {
      res.writeHead(200, {
        'Content-Type': 'application/javascript',
        // prevent cache http://stackoverflow.com/questions/49547/making-sure-a-web-page-is-not-cached-across-all-browsers
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(hoodiejs);
    }
  });

};
