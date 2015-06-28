var express = require('express');

module.exports = function(db) {
  var router = express.Router();

  router.get('/', function(req, res, next) {
    res.json(db.options);
  });

  router.get('/:option_name', function(req, res, next) {
    res.json(db.getOption(req.params.option_name));
  });

  return router;
};
