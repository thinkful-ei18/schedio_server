'use strict';
// const { clientSecret , clientID } = require('../config');
const clientSecret = require('../config').clientSecret || process.env.client_Secret;
const clientID = require('../config').clientID || process.env.client_ID;
const GooglePlusTokenStrategy = require('passport-google-plus-token');
const passport = require('passport');
const User = require('../models/users.models');
passport.use(
  'googleToken',
  new GooglePlusTokenStrategy(
    {
      clientID,
      clientSecret
    },
    (accessToken, refreshToken, profile, done) => {
      //checking existing user
      User.findOne({ 'google.id': profile.id })
        .then(user => {
          // found user
          if (user) {
            return done(null, user);
          }
          // user have not register in our database
          user = {
            id: profile.id,
            firstname: profile.name.givenName,
            username: profile.emails[0].value,
            photo: profile.photos[0].value
          };
          return User.create({ google: user, local: user }).then(_user => {
            return done(null, user);
          });
        })
        .catch(err => {
          done(err, false, err.message);
        });
    }
  )
);
