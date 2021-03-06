// Generated by CoffeeScript 1.6.3
(function() {
  var colors, dirIsValid, fontello, fs, needle, path, pjson, print, program, unzip;

  colors = require('colors');

  fs = require('fs');

  needle = require('needle');

  print = require('util').print;

  path = require('path');

  program = require('commander');

  pjson = require("" + __dirname + "/../package.json");

  unzip = require('unzip');

  dirIsValid = function(path) {
    var e;
    try {
      if (fs.statSync(path).isDirectory()) {
        return true;
      } else {
        return false;
      }
    } catch (_error) {
      e = _error;
      fs.mkdirSync(path);
      return true;
    }
  };

  fontello = function() {
    program.version(pjson.version).usage('install').option('--config [path]', 'path to fontello config. defaults to ./config').option('--css [path]', 'path to css directory (optional). if provided, --font option is expected.').option('--font [path]', 'path to font directory (optional). if provided, --css option is expected.');
    program.command('install').description('download fontello. without --css and --font flags, the full download is extracted.').action(function(env, options) {
      var data, host;
      if (program.css && program.font) {
        if (!dirIsValid(program.css)) {
          print('--css path provided is not a directory.\n'.red);
          process.exit(1);
        }
        if (!dirIsValid(program.font)) {
          print('--font path provided is not a directory.\n'.red);
          process.exit(1);
        }
      }
      host = 'http://fontello.com';
      data = {
        config: {
          file: program.config || 'config.json',
          content_type: 'application/json'
        }
      };
      return needle.post(host, data, {
        multipart: true
      }, function(error, response, body) {
        var sessionId, zipFile;
        if (error) {
          throw error;
        }
        sessionId = body;
        if (response.statusCode === 200) {
          zipFile = needle.get("" + host + "/" + sessionId + "/get", function(error, response, body) {
            if (error) {
              throw error;
            }
          });
          if (program.css && program.font) {
            return zipFile.pipe(unzip.Parse()).on('entry', (function(entry) {
              var cssPath, dirName, fileName, fontPath, pathName, type, _ref;
              pathName = entry.path, type = entry.type;
              if (type === 'File') {
                dirName = (_ref = path.dirname(pathName).match(/\/([^\/]*)$/)) != null ? _ref[1] : void 0;
                fileName = path.basename(pathName);
                switch (dirName) {
                  case 'css':
                    cssPath = path.join(program.css, fileName);
                    return entry.pipe(fs.createWriteStream(cssPath));
                  case 'font':
                    fontPath = path.join(program.font, fileName);
                    return entry.pipe(fs.createWriteStream(fontPath));
                  default:
                    return entry.autodrain();
                }
              }
            })).on('finish', (function() {
              return print('Install complete.\n'.green);
            }));
          } else {
            return zipFile.pipe(unzip.Extract({
              path: '.'
            })).on('finish', (function() {
              return print('Install complete.\n'.green);
            }));
          }
        }
      });
    });
    return program.parse(process.argv);
  };

  module.exports = fontello;

}).call(this);
