'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _passportLocal = require('passport-local');

var _passportLocal2 = _interopRequireDefault(_passportLocal);

var _passportJwt = require('passport-jwt');

var _auth = require('./auth');

var _auth2 = _interopRequireDefault(_auth);

var _userModel = require('../app/models/user.model.js');

var _userModel2 = _interopRequireDefault(_userModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (passport) {

  var jwtOptions = {
    jwtFromRequest: _passportJwt.ExtractJwt.fromAuthHeader(),
    secretOrKey: _auth2.default.secret
  };

  // Define length boundariess for expected parameters
  var bounds = {

    username: {

      minLength: 3,

      maxLength: 16
    },

    password: {

      minLength: 8,

      maxLength: 128
    },

    email: {

      minLength: 5,

      maxLength: 256
    }
  };

  // Function to check a string against a REGEX for email validity
  var validateEmail = function validateEmail(email) {

    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

    return re.test(email);
  };

  // Helper function to validate string length
  var checkLength = function checkLength(string, min, max) {

    // If the string is outside the passed in bounds...
    if (string.length > max || string.length < min) return false;else return true;
  };

  // # Passport Session Setup

  // *required for persistent login sessions*

  // Passport needs the ability to serialize and deserialize users out of
  // session data

  // ## Serialize User
  passport.serializeUser(function (user, done) {

    if (!user) {
      done(null, null);
    } else {
      var sessionUser = {

        _id: user._id,
        hasValidSubscription: user.hasValidSubscription,
        username: user.local.username,

        role: user.role
      };

      done(null, sessionUser);
    }
  });

  // ## Deserialize User
  passport.deserializeUser(function (sessionUser, done) {

    // The sessionUser object is different from the user mongoose
    // collection

    // It is actually req.session.passport.user and comes from the
    // session collection
    done(null, sessionUser);
  });

  passport.use('jwt-login', new _passportJwt.Strategy(jwtOptions, function (payload, done) {
    console.log("TRYING JWT");
    _userModel2.default.findById(payload._id, function (err, user) {
      if (err) {
        return done(err, false);
      }

      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  }));

  // # Local Signup

  // We are using named strategies since we have one for login and one
  // for signup

  // By default, if there is no name, it would just be called 'local'

  passport.use('local-signup', new _passportLocal2.default({

    // By default, the local strategy uses username and password
    usernameField: 'username',

    passwordField: 'password',

    // Allow the entire request to be passed back to the callback
    passReqToCallback: true
  }, function (req, username, password, done) {

    // ## Data Checks

    // If the length of the username string is too long/short,
    // invoke verify callback
    if (!checkLength(username, bounds.username.minLength, bounds.username.maxLength)) {

      // ### Verify Callback

      // Invoke `done` with `false` to indicate authentication
      // failure
      return done(null, false,

      // Return info message object
      { signupMessage: 'Invalid username length.' });
    }

    // If the length of the password string is too long/short,
    // invoke verify callback
    if (!checkLength(password, bounds.password.minLength, bounds.password.maxLength)) {

      // ### Verify Callback

      // Invoke `done` with `false` to indicate authentication
      // failure
      return done(null, false,

      // Return info message object
      { signupMessage: 'Invalid password length.' });
    }

    // If the length of the email string is too long/short,
    // invoke verify callback
    if (!checkLength(req.body.email, bounds.email.minLength, bounds.email.maxLength)) {

      // ### Verify Callback

      // Invoke `done` with `false` to indicate authentication
      // failure
      return done(null, false,

      // Return info message object
      { signupMessage: 'Invalid email length.' });
    }

    // If the string is not a valid email...
    if (!validateEmail(req.body.email)) {

      // ### Verify Callback

      // Invoke `done` with `false` to indicate authentication
      // failure
      return done(null, false,

      // Return info message object
      { signupMessage: 'Invalid email address.' });
    }

    // Asynchronous
    // User.findOne will not fire unless data is sent back
    process.nextTick(function () {

      // Find a user whose email or username is the same as the passed
      // in data

      // We are checking to see if the user trying to login already
      // exists
      _userModel2.default.findOne({

        // Model.find `$or` Mongoose condition
        $or: [{ 'local.username': username }, { 'local.email': req.body.email }]
      }, function (err, user) {

        // If there are any errors, return the error
        if (err) return done(err);

        // If a user exists with either of those ...
        if (user) {

          // ### Verify Callback

          // Invoke `done` with `false` to indicate authentication
          // failure
          return done(null, false,

          // Return info message object
          { signupMessage: 'That username/email is already ' + 'taken.' });
        } else {
          (function () {

            // If there is no user with that email or username...

            // Create the user
            var newUser = new _userModel2.default();

            // Set the user's local credentials

            // Combat case sensitivity by converting username and
            // email to lowercase characters
            newUser.local.username = username.toLowerCase();

            newUser.local.email = req.body.email.toLowerCase();

            // Hash password with model method
            newUser.local.password = newUser.generateHash(password);

            // Save the new user
            newUser.save(function (err) {

              if (err) throw err;

              return done(null, newUser);
            });
          })();
        }
      });
    });
  }));

  // # Local Login

  // We are using named strategies since we have one for login and one
  // for signup

  // By default, if there is no name, it would just be called 'local'

  passport.use('local-login', new _passportLocal2.default({

    // By default, local strategy uses username and password
    usernameField: 'username',

    passwordField: 'password',

    // Allow the entire request to be passed back to the callback
    passReqToCallback: true
  }, function (req, username, password, done) {

    // ## Data Checks

    // If the length of the username string is too long/short,
    // invoke verify callback.
    // Note that the check is against the bounds of the email
    // object. This is because emails can be used to login as
    // well.
    if (!checkLength(username, bounds.username.minLength, bounds.email.maxLength)) {

      // ### Verify Callback

      // Invoke `done` with `false` to indicate authentication
      // failure
      return done(null, false,

      // Return info message object
      { loginMessage: 'Invalid username/email length.' });
    }

    // If the length of the password string is too long/short,
    // invoke verify callback
    if (!checkLength(password, bounds.password.minLength, bounds.password.maxLength)) {

      // ### Verify Callback

      // Invoke `done` with `false` to indicate authentication
      // failure
      return done(null, false,

      // Return info message object
      { loginMessage: 'Invalid password length.' });
    }

    // Find a user whose email or username is the same as the passed
    // in data

    // Combat case sensitivity by converting username to lowercase
    // characters
    _userModel2.default.findOne({

      // Model.find `$or` Mongoose condition
      $or: [{ 'local.username': username.toLowerCase() }, { 'local.email': username.toLowerCase() }]
    }, function (err, user) {

      // If there are any errors, return the error before anything
      // else
      if (err) return done(err);

      // If no user is found, return a message
      if (!user) {

        return done(null, false, { loginMessage: 'That user was not found. ' + 'Please enter valid user credentials.' });
      }

      // If the user is found but the password is incorrect
      if (!user.validPassword(password)) {

        return done(null, false, { loginMessage: 'Invalid password entered.' });
      }

      // Otherwise all is well; return successful user
      return done(null, user);
    });
  }));
};

// Load user model
// ```
// passport.conf.js
// (c) 2015 David Newman
// david.r.niciforovic@gmail.com
// passport.conf.js may be freely distributed under the MIT license
// ```

// *config/passport.conf.js*

// This file contains the function which configures the PassportJS
// instance passed in.

// Load PassportJS strategies