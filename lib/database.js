var fs = require('fs'),
  searchIndex = require('search-index')({ logLevel: 'error' }),
  _ = require('underscore'),
  async = require('async'),
  parser = require('./parser');

var parseXmlCallback = function(db, key) {
  return function(err, data) {
    if (!err && data) {
      db[key] = data;
      console.log(key, 'data refresh:', data);
    }
  }
};

var parsePageCallback = function(db, pageContent, pageWatch) {
  return function(err, data) {
    if (!err && data) {
      db['pages'] = data;
      console.log('page data refresh:', data);
      _.each(db.pages.pages, function(page) {
        var updateContent = function(err, content) {
          if (!err) page.content = content.content;
        }

        pageContent(page, updateContent);
        pageWatch(page, updateContent);
      });

      startIndexLoop(db);
    }
  }
};

var indexPages = function(db) {
  searchIndex.empty(function(err) {
    if (err) console.log('error emptying index:', err);
    else {
      searchIndex.add({ batchName: 'pages', filters: ['title', 'content', 'keywords', 'tag'] }, db.pages.pages, function(err) {
        if (err) console.log('indexing error:', err);
        else console.log('indexing completed');
      });
    }
  });
};

var indexingStarted = false;
var startIndexLoop = function(db) {
  if ( !indexingStarted ) {
    indexingStarted = true;
    indexPages(db);
    setInterval(indexPages, 30000, db);
  }
};

var getPageFilename = function(pageStorageDir, id) {
  return pageStorageDir + '/' + id + '.page.txt';
};

var initDatabase = function(storageDir, pageContent, pageWatch) {
  var db = {
    pages: {},
    users: {},
    menu: {},
    options: {}
  };

  var databaseDir = storageDir + "/database";
  _.each(['users', 'menu', 'options'], function(key) {
    var file = databaseDir + '/' + key + '.table.xml';
    parser.parseSimpleXmlFile(file, parseXmlCallback(db, key));
    fs.watch(file, function(event, filename) {
      parser.parseSimpleXmlFile(databaseDir + '/' + filename, parseXmlCallback(db, key));
    });
  });

  var pageFile = databaseDir + '/pages.table.xml';
  parser.parseSimpleXmlFile(pageFile, parsePageCallback(db, pageContent, pageWatch));
  fs.watch(pageFile, function(event, filename) {
    parser.parseSimpleXmlFile(databaseDir + '/' + filename, parsePageCallback(db, pageContent, pageWatch));
  });

  return db;
};

var pageLoadFn = function(pageStorageDir) {
  return function(page, callback) {
    console.log('loading page', page);
    if (!page) callback(new Error("Page not found"));
    else {
      fs.readFile(getPageFilename(pageStorageDir, page.id), function(err, data) {
        if (err) {
          console.log('error reading page', page.id, 'file', err);
          callback(err);
        }
        else callback(undefined, _.extend(page, { content: data.toString() }));
      });
    }
  };
};

var pageWatchFn = function(pageStorageDir, pageContent) {
  return function(page, callback) {
    var filename = getPageFilename(pageStorageDir, page.id);
    fs.unwatchFile(filename);
    fs.exists(filename, function(exists) {
      if (exists) {
        console.log('watching', filename);
        fs.watch(filename, function() {
          pageContent(page, callback);
        });
      }
    });
  }
};

module.exports = function(storageDir) {
  var pageContent = pageLoadFn(storageDir + "/pages");
  var pageWatch = pageWatchFn(storageDir + "/pages", pageContent);
  var db = initDatabase(storageDir, pageContent, pageWatch);

  db.getPage = function(id, callback) {
    pageContent(_.findWhere(db.pages.pages, { "id": id }), callback);
  };

  db.findPage = function(query, callback) {
    pageContent(_.findWhere(db.pages.pages, query), function(err, page) {
      if (err) {
        console.log('error finding page', err);
        callback(err);
      }
      else {
        page.subpages = {};
        async.map(
          _.where(db.pages.pages, { parent: page.slug }),
          pageContent,
          function(err, subpages) {
            if ( subpages ) {
              _.each(subpages, function(subpage) {
                page.subpages[subpage.slug] = subpage;
              });
            }
            console.log('returning page', page);
            callback(err, page);
          }
        );
      }
    });
  };

  db.getOption = function(name) {
    return _.findWhere(db.options.options, { "name": name });
  };

  db.getSearchIndex = function() {
    return searchIndex;
  };

  return db;
};
