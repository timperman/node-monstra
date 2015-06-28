var express = require('express'),
  _ = require('underscore');

var jsonData = function(res, next) {
  return function(err, data) {
    if (err) {
      var e = new Error('Not Found');
      e.status = 404;
      next(e);
    }
    else {
      res.json(data);
    }
  };
};

module.exports = function(db) {
  var router = express.Router();

  router.get('/', function(req, res) {
    res.json(db.pages);
  });

  router.get('/id/:page_id', function(req, res, next) {
    db.getPage(req.params.page_id, jsonData(res, next));
  });

  router.post('/find', function(req, res, next) {
    db.findPage(req.body, jsonData(res, next));
  });

  router.get('/default', function(req, res, next) {
    db.findPage({ slug: db.getOption('defaultpage').value }, jsonData(res, next));
  });

  router.get('/search', function(req, res, next) {
    db.getSearchIndex().search({ query: { "*": [req.query.q] }}, jsonData(res, next));
  });

  router.get('/:slug', function(req, res, next) {
    db.findPage({ slug: req.params.slug }, jsonData(res, next));
  });

  return router;
};
