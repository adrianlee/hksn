var express = require('express'),
    http = require('http'),
    path = require('path'),

    // Third Party
    hbs = require('hbs');

var Tumblr = require('tumblr').Tumblr;
var blog = new Tumblr('mcgillhksn.tumblr.com', 'kJChG5pOCSiCOXbjefjZFKk0mDWL6X25On0t6hi0uN4JNzqQgo');

var FB = require('fb');
FB.setAccessToken('AAACEdEose0cBAGPHsjqEOjjFNeEy5y7GeEa8CrXZBUwYWGoDYsU3uBqrSSZBbWQZBZCPKcRQLzgUpmHoUOaEbCGnPBNuZBCmsZAzokfpw4CwZDZD');

var moment = require('moment');

var app = express();

////////////////////////////////////////////////
// Express Configuration
////////////////////////////////////////////////
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.engine('html', require('hbs').__express);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

////////////////////////////////////////////////
// Handlebars
////////////////////////////////////////////////
var blocks = {};

hbs.registerHelper('extend', function(name, context) {
    var block = blocks[name];
    if (!block) {
        block = blocks[name] = [];
    }

    block.push(context(this));
});

hbs.registerHelper('block', function(name) {
    var val = (blocks[name] || []).join('\n');

    blocks[name] = [];
    return val;
});

hbs.registerHelper('unescape', function (post) {
  var html;
  html = unescape(post);
  return html;
});

hbs.registerHelper('post-date-tag', function (post) {
  var date,
      string;

  date = moment.unix(post.timestamp).fromNow();
  string = date + " - " + post.tags;

  return string;
});

////////////////////////////////////////////////
// Router
////////////////////////////////////////////////
app.get('/', function(req, res) {
  blog.posts({limit: 3}, function(error, response) {
    if (error) {
      throw new Error(error);
    }
    res.render('index', { title: 'HKSN', posts: response.posts });
  });
});

app.get('/page', function(req, res) {
  FB.api('376965089046024/attending', { fields: ['id', 'name'] }, function (fbres) {
    if(!fbres || fbres.error) {
      console.log(fbres.error);
      return;
    }
    console.log(fbres);
    res.render('page', { title: 'HKSN' });
  });
});

app.get('/academics', function(req, res) {
  blog.posts({tag: "academics"}, function(error, response) {
    if (error) {
      throw new Error(error);
    }
    res.render('academics', { title: 'HKSN', posts: response.posts });
  });
});

app.get('/events', function(req, res) {
  blog.posts({tag: "events"}, function(error, response) {
    if (error) {
      throw new Error(error);
    }
    res.render('events', { title: 'HKSN', posts: response.posts });
  });
});

app.get('/food', function(req, res) {
  blog.posts({tag: "food"}, function(error, response) {
    if (error) {
      throw new Error(error);
    }
    res.render('food', { title: 'HKSN', posts: response.posts });
  });
});

app.get('/news', function(req, res) {
  blog.posts({tag: "news"}, function(error, response) {
    if (error) {
      throw new Error(error);
    }
    res.render('news', { title: 'HKSN', posts: response.posts });
  });
});

app.get('/sponsors', function(req, res) {
  res.render('sponsors', { title: 'HKSN' });
});

////////////////////////////////////////////////
// HTTP Server
////////////////////////////////////////////////
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
