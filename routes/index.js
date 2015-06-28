var express = require('express'),
    gmailer = require('../lib/gmailer');

module.exports = function(db) {
  var router = express.Router();

  router.get('/', function(req, res, next) {
    db.findPage({ slug: db.getOption('defaultpage').value }, function(err, page) {
      if (err) res.render('index');
      else res.render('index', page);
    });
  });

  router.get('/search', function(req, res, next) {
    db.getSearchIndex().search({ query: { "*": [req.query.q.split(' ')] }}, function(err, results) {
      if (err) res.render('error');
      else res.render('search', results);
    });
  });

  router.post('/comments', function(req, res, next) {
    gmailer.sendCommentsEmail(req.body.email, req.body.name, req.body.message);
    res.render('commentsent');
  });

  router.get('/:slug', function(req, res, next) {
    db.findPage({ slug: req.params.slug }, function(err, page) {
      if (err) {
        console.log(req.params.slug, 'cms page not found');
        res.render(req.params.slug);
      }
      else
        res.render(req.params.slug, page);
    });
  });

  return router;
};
