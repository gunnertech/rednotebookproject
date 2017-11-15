// ```
// routes.js
// (c) 2015 David Newman
// david.r.niciforovic@gmail.com
// routes.js may be freely distributed under the MIT license
// ```

// */app/routes.js*

import moment from 'moment';

// ## Node API Routes

// Define routes for the Node backend

// Load our API routes for user authentication
import authRoutes from './routes/_authentication.router.js';

import partRoutes from './routes/_part.router.js';
import documentRoutes from './routes/_document.router.js';
import sectionRoutes from './routes/_section.router.js';
import inputRoutes from './routes/_input.router.js';
import responseRoutes from './routes/_response.router.js';
import fileRoutes from './routes/_file.router.js';
import assignmentRoutes from './routes/_assignment.router.js';
import notificationRoutes from './routes/_notification.router.js';
import stateRoutes from './routes/_state.router.js';
import subscriptionRoutes from './routes/_subscription.router.js';
import notebookRoutes from './routes/_notebook.router.js';

import User from './models/user.model.js';

import passport from 'passport';
import basicAuth from 'basic-auth';

var jwtAuth = passport.authenticate('jwt-login', {session: false});



export default (app, router, passport) => {

  // ### Express Middlware to use for all requests
  router.use((req, res, next) => {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, EncryptionKey");

    console.log('I sense a disturbance in the force...'); // DEBUG
    // Make sure we go to the next routes and don't stop here...
    next();
  });

  // Define a middleware function to be used for all secured routes
  let auth = (req, res, next) => {
    if (req.isAuthenticated()) {
      console.log("Authenticated via session");
      next();
    } else {
      console.log("Let's try JWT");
      passport.authenticate('jwt-login', {session: false}, (err, user, info) => {
        if (err) { 
          next(err);
        } else if(user) {
          console.log("Authenticated via jwt");
          req.user = user;
          next();
        } else {
          /// let's try basic auth!
          function unauthorized(res) {
            if (req.accepts('html, json') === 'json') {
              res.status(401).json({message: "Not logged in"});
            } else {
              res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
              return res.sendStatus(401);
            }
            
          };

          var u = basicAuth(req);

          if (!u || !u.name || !u.pass) {
            return unauthorized(res);
          };

          User.findOne({
            $or : [

              { 'local.username' : u.name },

              { 'local.email' : u.name }
            ]
          })
          .then(function(user) {
            if (!user || !user.validPassword(u.pass)) {
              return unauthorized(res);
            } else {
              req.user = user;
              return next();  
            }
          })
          .error(function() {
            return unauthorized(res);
          });
        } 
      })(req, res, next);
    }
  };

  let admin = (req, res, next) => {
    User.findById(req.user._id, function(err, foundUser) {
      if(err) {
        res.status(422).json({error: 'No user found.'});
        next(err);
      } else if('admin' === foundUser.role) {
        next();
      } else {
        res.status(401).json({error: 'You are not authorized to view this content'});
      }
    });
  }


  let paid = (req, res, next) => {
    var today = moment().startOf('day');

    User.findById(req.user._id, function(err, user) { 
      var accountStartDate = moment(user && user.createdAt ? user.createdAt : Date.now() ).startOf('day');
      var daysBetween = today.diff(accountStartDate,'days');

      console.log("~~~~~~~~~~~")
      console.log(daysBetween)
      console.log(user)
      console.log("~~~~~~~~~~~")

      if(user.role === 'admin') {
        next();
      } else if(user.recurlyAccountStatus == 'in_trial' && daysBetween > 30) {
        res.status(401).json({message: "Free Trial Ended"});
        next('Unauthorized');
      } else if(!user.hasValidSubscription) {
        status(401).json({message: "Not Paid"});
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
  authRoutes(app, router, passport, auth, admin, paid);

  // #### RESTful API Routes
  notebookRoutes(app, router, auth, admin, paid);
  partRoutes(app, router, auth, admin, paid);
  documentRoutes(app, router, auth, admin, paid);
  sectionRoutes(app, router, auth, admin, paid);
  inputRoutes(app, router, auth, admin, paid);
  responseRoutes(app, router, auth, admin, paid);
  fileRoutes(app, router, auth, admin, paid);
  assignmentRoutes(app, router, auth, admin, paid);
  notificationRoutes(app, router, auth, admin, paid);
  stateRoutes(app, router, auth, admin, paid);
  subscriptionRoutes(app, router, auth, admin, paid);
	

	// All of our routes will be prefixed with /api
	app.use('/api', router);

  // ### Frontend Routes

  // Route to handle all Angular requests
  app.get('*', (req, res) => {

    // Load our src/app.html file
    //** Note that the root is set to the parent of this folder, ie the app root **
    res.sendFile('/dist/index.html', { root: __dirname + "/../"});
  });
};
