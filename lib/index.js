var database = require('./database'),
  _ = require('underscore');

var databases = {};

module.exports = function(storagePath) {
  if (!_.has(databases, storagePath)) {
    databases[storagePath] = database(storagePath);
  }

  return databases[storagePath];
};
