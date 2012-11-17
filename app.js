var express = require('express'),
    http = require('http'),
    path = require('path'),

    // Third Party
    hbs = require('hbs');

var Tumblr = require('tumblr').Tumblr;
var blog = new Tumblr('mcgillhksn.tumblr.com', 'kJChG5pOCSiCOXbjefjZFKk0mDWL6X25On0t6hi0uN4JNzqQgo');

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

hbs.registerHelper('post-link', function (post) {
  var temp;

  temp = "<a href=\"/" + post.tags + "\">" + post.title + "</a>";

  return temp;
});

////////////////////////////////////////////////
// Router
////////////////////////////////////////////////
app.get('/', function(req, res) {
  blog.posts({limit: 3}, function(error, response) {
    var newArray = [];
    if (error) {
      throw new Error(error);
    }
    for (var i=0; i < response.posts.length; i++) {
      if (response.posts[i].tags != "about") {
        newArray.push(response.posts[i]);
      }
    }
    console.log(newArray);
    res.render('index', { title: 'HKSN', posts: newArray });
  });
});

app.get('/academics', function(req, res) {
  fetchBlogPost(res, "academics");
});

app.get('/events', function(req, res) {
  fetchBlogPost(res, "events");
});

app.get('/food', function(req, res) {
  blog.posts({tag: "about"}, function(error, response) {
    if (error) {
      throw new Error(error);
    }
    console.log(response.posts);
    fetchBlogPost(res, "food", response.posts[0]);
  });
});

app.get('/news', function(req, res) {
  fetchBlogPost(res, "news");
});

app.get('/exec', function(req, res) {
  fetchBlogPost(res, "exec");
});

app.get('/sponsors', function(req, res) {
  res.render('sponsors', { title: 'HKSN' });
});

function fetchBlogPost(res, tag, extra) {
  blog.posts({tag: tag}, function(error, response) {
    if (error) {
      throw new Error(error);
    }
    // console.log(response.posts);
    res.render(tag, { title: 'HKSN', posts: response.posts, about: extra });
  });
}

////////////////////////////////////////////////
// HTTP Server
////////////////////////////////////////////////
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
