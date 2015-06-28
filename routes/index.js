var express = require('express');

module.exports = function(db) {
  var router = express.Router();

  router.get('/', function(req, res, next) {
    db.findPage({ slug: db.getOption('defaultpage').value }, function(err, page) {
      if (err) res.render('index');
      else res.render('index', page);
    });
  });

  router.get('/:slug', function(req, res, next) {
    db.findPage({ slug: req.params.slug }, function(err, page) {
      if (err) {
        var e = new Error("Not found");
        e.status = 404;
        next(e);
      }
      else
        res.render(req.params.slug, page);
    });
  });

  return router;
};
