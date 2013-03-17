var mongoose = require('mongoose');
mongoose.connect('mongodb://hksn:hksn@linus.mongohq.com:10068/hksn');

var db = module.exports = {};

var userSchema = {
  facebook_id: String,
  username: String,
  display_name: String,
  gender: String,
  emails: [{ value: String }],
  createdAt: { type: Date, default: Date.now },
};

var bidSchema = {
  bid_amount: Number,
  facebook_id: String,
  display_name: String,
  timestamp: { type: Date, default: Date.now }
};

db.User = mongoose.model('User', mongoose.Schema(userSchema));
db.Bid = mongoose.model('Bid', mongoose.Schema(bidSchema));