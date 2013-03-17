var express = require('express'),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),


    // Third Party
    hbs = require('hbs');

var Tumblr = require('tumblr').Tumblr;
var blog = new Tumblr('mcgillhksn.tumblr.com', 'kJChG5pOCSiCOXbjefjZFKk0mDWL6X25On0t6hi0uN4JNzqQgo');

var moment = require('moment');

var pass = require('./lib/passport');

var app = express();

var api = require('./lib/api');

var RedisStore = require('connect-redis')(express);

////////////////////////////////////////////////
// Express Configuration
////////////////////////////////////////////////
app.configure(function(){
  app.set('port', process.argv[2] || process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.engine('html', require('hbs').__express);
  app.use(express.static(path.join(__dirname, 'public'), {maxAge: 86400000}));
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ store: new RedisStore({host: "cod.redistogo.com", port: "10354", pass: "64f066699f523cb0ee31b766b4625f62"}), secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(api);
  app.use(app.router);
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

hbs.registerHelper('json', function(json) {
  try {
    return JSON.stringify(json, null, ' ');
  } catch (e) {
    console.log(e);
  }
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
    // console.log(newArray);
    res.render('index', { title: 'HKSN', posts: newArray });
  });
});

app.get('/kaplan', function(req, res) {
  console.log(req.user);
  res.locals.user = req.user;
  res.render('kaplan_auction', { title: 'HKSN' });
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
    //console.log(response.posts);
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
    console.log(response.posts.length);
    // console.log(response.posts);
    for (var i in response.posts) {
      console.log(response.posts[i].title);
    }

    res.render(tag, { title: 'HKSN', posts: response.posts, about: extra });
  });
}

app.get('/auth/facebook',
  passport.authenticate('facebook', {
    scope: [
      'email'
    ]
  })
);

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/kaplan',
    failureRedirect: '/kaplan'
  })
);

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

////////////////////////////////////////////////
// HTTP Server
////////////////////////////////////////////////
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
