var express = require('express'),
    gmailer = require('../lib/gmailer');

module.exports = function(db) {
  var renderDefaultPage = function(req, res, next) {
    db.findPage({ slug: db.getOption('defaultpage').value }, function(err, page) {
      if (err) res.render('index');
      else res.render('index', page);
    });
  };

  var router = express.Router();

  router.get('/', renderDefaultPage);

  router.get('/search', function(req, res, next) {
    db.getSearchIndex().search({ query: { "*": [req.query.q.split(' ')] }}, function(err, results) {
      if (err) {
        console.log('search error', err);
        res.render('error');
      }
      else {
        if (req.query.tag) {
          results.hits = _.filter(results.hits, function(hit) {
            return ( hit.document.tags === "" || hit.document.tags.indexOf(req.query.tag) >= 0 );
          });
        }
        results.hits = _.map(results.hits, function(hit) {
          if (hit.document.slug.indexOf("-hash-") > 0) {
            hit.document = _.extend(hit.document, { slug: hit.document.slug.replace('-hash-', '#') });
          }

          return hit;
        });
        res.render('search', results);
      }
    });
  });

  router.post('/comments', function(req, res, next) {
    gmailer.sendCommentsEmail(req.body.email, req.body.name, req.body.message);
    res.render('commentsent');
  });

  router.get('/:slug', function(req, res, next) {
    if ( req.params.slug ) {
      var pageSlug = req.params.slug.split(".");
      db.findPage({ slug: pageSlug[0].toLowerCase() }, function(err, page) {
        if (err) {
          console.log(pageSlug[0], 'cms page not found');
          res.render(pageSlug[0]);
        }
        else
          res.render(pageSlug[0], page);
      });
    }
    else
      renderDefaultPage(req, res, next);
  });

  return router;
};
