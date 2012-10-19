var express = require('express'),
    http = require('http'),
    path = require('path'),

    // Third Party
    hbs = require('hbs');

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

    // clear the block
    blocks[name] = [];
    return val;
});

////////////////////////////////////////////////
// Router
////////////////////////////////////////////////
app.get('/', function(req, res) {
  res.render('index', { title: 'HKSN' });
});

app.get('/page', function(req, res) {
  res.render('page', { title: 'HKSN' });
});

app.get('/events', function(req, res) {
  res.render('events', { title: 'HKSN' });
});

app.get('/academics', function(req, res) {
  res.render('academics', { title: 'HKSN' });
});

app.get('/events', function(req, res) {

  var Tumblr = require('tumblr').Tumblr;
  var blog = new Tumblr('mcgillhksn.tumblr.com', 'kJChG5pOCSiCOXbjefjZFKk0mDWL6X25On0t6hi0uN4JNzqQgo');

  console.log(blog);

  blog.text({limit: 2}, function(error, response) {
    if (error) {
      throw new Error(error);
    }

    console.log(response.posts);
    res.render('events', { title: 'HKSN', blog: response.posts });
  });
});

////////////////////////////////////////////////
// HTTP Server
////////////////////////////////////////////////
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
