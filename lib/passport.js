var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    _ = require('lodash'),
    db = require('./mongoose');

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: '598389053522129',
    clientSecret: 'e0402193a4eca0d81825d281c4ea4d45',
    callbackURL: "/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    db.User.findOne({ facebook_id: profile.id }, function (err, doc) {
      // Error
      if (err) {
        return done(err);
      }

      accessToken = { accessToken: accessToken };

      // If found, return
      if (doc) {
        return done(null, _.extend(doc.toObject(), accessToken));
      }

      if (!doc) {
        var user = new db.User;

        user.username = profile.username;
        user.display_name = profile.displayName;
        user.gender = profile.gender;
        user.facebook_id = profile.id;
        user.emails = profile.emails;

        user.save(function (err, doc) {
          console.log(doc);
          done(null, _.extend(_.omit(doc, ['_raw']), accessToken));
        });
      }
    });
  }
));

// Serialize - runs once when logging in
passport.serializeUser(function(user, done) {
  console.log("serializeUser");
  console.log(user);
  done(null, user._id);
});


// Deserialize - runs on every request
passport.deserializeUser(function(id, done) {
  // console.log(id);
  // done(null, user);
  db.User.findById(id, function(err, user) {
    // console.log(user);
    done(err, user);
  });
});