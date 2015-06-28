var fs = require('fs'),
  xml2js = require('xml2js');

var parser = new xml2js.Parser({ explicitRoot: false, explicitArray: false });

module.exports = {
  parseSimpleXmlFile: function(filename, callback) {
    fs.readFile(filename, function(err, data) {
      if (err)
        callback(err);
      else
        parser.parseString(data, function (err, result) {
          if (err)
            callback(err);
          else
            callback(undefined, result);
        });
    });
  }
};
