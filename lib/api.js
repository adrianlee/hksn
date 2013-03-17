var express = require('express'),
    db = require('./mongoose'),
    _ = require('lodash');

var app = module.exports = express();

// list all users
app.get('/api/users', function (req, res) {
  db.User
  .find({})
  .select('username display_name facebook_id')
  .exec(function (err, doc) {
    res.json(doc);
  });
});

app.get('/api/fetchAllBid', function (req, res) {
  db.Bid
  .find({})
  .sort('-timestamp')
  .exec(function (err, doc) {
    if (err) {
      return res.json({ error: "something went wrong"});
    }
    res.json(doc);
  });
});

app.get('/api/fetchCurrentBid', function (req, res) {
  db.Bid
  .find({})
  .exec(function (err, doc) {
    var total_bid = 550;
    _.forEach(doc, function (bid) {
      total_bid += bid.bid_amount;
    });
    res.json({ current_bid: total_bid });
  });
});

app.get('/api/fetchLatestBid', function (req, res) {
  db.Bid
  .find({})
  .limit(1)
  .sort("-timestamp")
  .exec(function (err, doc) {
    res.json(doc);
  });
});


app.get('/api/fetchBids', function (req, res) {
  db.Bid
  .find({})
  .sort("-timestamp")
  .exec(function (err, doc) {
    res.json(doc);
  });
});

app.post('/api/placeBid/:number', function (req, res) {
  var bid_amount = parseInt(req.param("number"));

  if (!req.user) {
    return res.json({error: "hey, no cheating!"});
  }

  if (bid_amount <= 50 && bid_amount >= 100) {
    return res.json({error: "hey, no cheating!"});
  }

  var bid = new db.Bid();
  bid.bid_amount = bid_amount;
  bid.facebook_id = req.user.facebook_id;
  bid.display_name = req.user.display_name;

  bid.save(function (err) {
    if (err) {
      return res.json({error: "something went wrong with save"});
    }

    res.json({ msg: "yay!" });

  });
});