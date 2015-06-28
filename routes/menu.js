var express = require('express');

module.exports = function(db) {
  var router = express.Router();

  router.get('/', function(req, res, next) {
    res.json(db.menu);
  });

  return router;
};
