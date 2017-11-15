'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; // ```
// routes.js
// (c) 2015 David Newman
// david.r.niciforovic@gmail.com
// routes.js may be freely distributed under the MIT license
// ```

// */app/routes.js*

// ## Node API Routes

// Define routes for the Node backend

// Load our API routes for user authentication


var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _authenticationRouter = require('./routes/_authentication.router.js');

var _authenticationRouter2 = _interopRequireDefault(_authenticationRouter);

var _partRouter = require('./routes/_part.router.js');

var _partRouter2 = _interopRequireDefault(_partRouter);

var _documentRouter = require('./routes/_document.router.js');

var _documentRouter2 = _interopRequireDefault(_documentRouter);

var _sectionRouter = require('./routes/_section.router.js');

var _sectionRouter2 = _interopRequireDefault(_sectionRouter);

var _inputRouter = require('./routes/_input.router.js');

var _inputRouter2 = _interopRequireDefault(_inputRouter);

var _responseRouter = require('./routes/_response.router.js');

var _responseRouter2 = _interopRequireDefault(_responseRouter);

var _fileRouter = require('./routes/_file.router.js');

var _fileRouter2 = _interopRequireDefault(_fileRouter);

var _assignmentRouter = require('./routes/_assignment.router.js');

var _assignmentRouter2 = _interopRequireDefault(_assignmentRouter);

var _notificationRouter = require('./routes/_notification.router.js');

var _notificationRouter2 = _interopRequireDefault(_notificationRouter);

var _stateRouter = require('./routes/_state.router.js');

var _stateRouter2 = _interopRequireDefault(_stateRouter);

var _subscriptionRouter = require('./routes/_subscription.router.js');

var _subscriptionRouter2 = _interopRequireDefault(_subscriptionRouter);

var _notebookRouter = require('./routes/_notebook.router.js');

var _notebookRouter2 = _interopRequireDefault(_notebookRouter);

var _userModel = require('./models/user.model.js');

var _userModel2 = _interopRequireDefault(_userModel);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _basicAuth = require('basic-auth');

var _basicAuth2 = _interopRequireDefault(_basicAuth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jwtAuth = _passport2.default.authenticate('jwt-login', { session: false });

exports.default = function (app, router, passport) {

  // ### Express Middlware to use for all requests
  router.use(function (req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, EncryptionKey");

    console.log('I sense a disturbance in the force...'); // DEBUG
    // Make sure we go to the next routes and don't stop here...
    next();
  });

  // Define a middleware function to be used for all secured routes
  var auth = function auth(req, res, next) {
    if (req.isAuthenticated()) {
      console.log("Authenticated via session");
      next();
    } else {
      console.log("Let's try JWT");
      passport.authenticate('jwt-login', { session: false }, function (err, user, info) {
        if (err) {
          next(err);
        } else if (user) {
          console.log("Authenticated via jwt");
          req.user = user;
          next();
        } else {
          var u;

          var _ret = function () {
            /// let's try basic auth!
            var unauthorized = function unauthorized(res) {
              if (req.accepts('html, json') === 'json') {
                res.status(401).json({ message: "Not logged in" });
              } else {
                res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
                return res.sendStatus(401);
              }
            };

            ;

            u = (0, _basicAuth2.default)(req);


            if (!u || !u.name || !u.pass) {
              return {
                v: unauthorized(res)
              };
            };

            _userModel2.default.findOne({
              $or: [{ 'local.username': u.name }, { 'local.email': u.name }]
            }).then(function (user) {
              if (!user || !user.validPassword(u.pass)) {
                return unauthorized(res);
              } else {
                req.user = user;
                return next();
              }
            }).error(function () {
              return unauthorized(res);
            });
          }();

          if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        }
      })(req, res, next);
    }
  };

  var admin = function admin(req, res, next) {
    _userModel2.default.findById(req.user._id, function (err, foundUser) {
      if (err) {
        res.status(422).json({ error: 'No user found.' });
        next(err);
      } else if ('admin' === foundUser.role) {
        next();
      } else {
        res.status(401).json({ error: 'You are not authorized to view this content' });
      }
    });
  };

  var paid = function paid(req, res, next) {
    var today = (0, _moment2.default)().startOf('day');

    _userModel2.default.findById(req.user._id, function (err, user) {
      var accountStartDate = (0, _moment2.default)(user && user.createdAt ? user.createdAt : Date.now()).startOf('day');
      var daysBetween = today.diff(accountStartDate, 'days');

      console.log("~~~~~~~~~~~");
      console.log(daysBetween);
      console.log(user);
      console.log("~~~~~~~~~~~");

      if (user.role === 'admin') {
        next();
      } else if (user.recurlyAccountStatus == 'in_trial' && daysBetween > 30) {
        res.status(401).json({ message: "Free Trial Ended" });
        next('Unauthorized');
      } else if (!user.hasValidSubscription) {
        status(401).json({ message: "Not Paid" });
        next('Unauthorized');
      } else {
        next();
      }
    });
  };

  // ### Server Routes

  // Handle things like API calls,

  // #### Authentication routes

  // Pass in our Express app and Router.
  // Also pass in auth & admin middleware and Passport instance
  (0, _authenticationRouter2.default)(app, router, passport, auth, admin, paid);

  // #### RESTful API Routes
  (0, _notebookRouter2.default)(app, router, auth, admin, paid);
  (0, _partRouter2.default)(app, router, auth, admin, paid);
  (0, _documentRouter2.default)(app, router, auth, admin, paid);
  (0, _sectionRouter2.default)(app, router, auth, admin, paid);
  (0, _inputRouter2.default)(app, router, auth, admin, paid);
  (0, _responseRouter2.default)(app, router, auth, admin, paid);
  (0, _fileRouter2.default)(app, router, auth, admin, paid);
  (0, _assignmentRouter2.default)(app, router, auth, admin, paid);
  (0, _notificationRouter2.default)(app, router, auth, admin, paid);
  (0, _stateRouter2.default)(app, router, auth, admin, paid);
  (0, _subscriptionRouter2.default)(app, router, auth, admin, paid);

  // All of our routes will be prefixed with /api
  app.use('/api', router);

  // ### Frontend Routes

  // Route to handle all Angular requests
  app.get('*', function (req, res) {

    // Load our src/app.html file
    //** Note that the root is set to the parent of this folder, ie the app root **
    res.sendFile('/dist/index.html', { root: __dirname + "/../" });
  });
};