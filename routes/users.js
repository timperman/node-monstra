var express = require('express');

module.exports = function(db) {
  var router = express.Router();

  router.get('/', function(req, res, next) {
    res.json(db.users);
  });

  router.post('/user', function(req, res) {
    res.json(_.findWhere(db.users, req.body));
  });

  return router;
};
