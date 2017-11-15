// ```
// server.conf.js
// (c) 2016 David Newman
// david.r.niciforovic@gmail.com
// server.conf.js may be freely distributed under the MIT license
// ```

// *server.conf.js*

//  This is the file where we will:
//  - Configure our application
//  - Connect to our database
//  - Create our Mongoose models
//  - Define routes for our RESTful API
//  - Define routes for our frontend Angular application
//  - Set the app to listen on a port so we can view it in our browser

// # Node Env Variables

// Load Node environment variable configuration file
import {validateEnvVariables} from './config/env.conf.js';

// Set up appropriate environment variables if necessary
validateEnvVariables();

// # Modules

// Load Express
import express from 'express';
// Load Socket.io
import socketio from 'socket.io';
// Load Node http module
import http from 'http';
// Create our app with Express
let app = express();
// Create a Node server for our Express app
let server = http.createServer(app);
// Integrate Socket.io
let io = socketio.listen(server);
// Load Mongoose for MongoDB interactions
import mongoose from 'mongoose';
import Promise from 'bluebird';
mongoose.Promise = Promise;

// Log requests to the console (Express 4)
//if (process.env.NODE_ENV == 'development') {
//var morgan = require('morgan');
//import morgan from 'morgan';
//}

// Pull information from HTML POST (express 4)
import bodyParser from 'body-parser';
// Simulate DELETE and PUT (Express 4)
import methodOverride from 'method-override';
// PassportJS
import passport from 'passport';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import cookieSession from 'cookie-session';

// # Configuration

// Load Socket.io server functionality
import base from './sockets/base';

// base(io);

// Set the port for this app
let port = process.env.PORT || 8080;

// Load Mongoose config file for connecting to MongoDB instance
import mongooseConf from './config/mongoose.conf.js';

// Pass Mongoose configuration Mongoose instance
mongooseConf(mongoose);

// Import PassportJS configuration
import passportConf from './config/passport.conf.js';

// Pass Passport configuration our PassportJS instance
passportConf(passport);

//if (process.env.NODE_ENV === 'development' ||
 //   process.env.NODE_ENV === 'test')
  // Log every request to the console
  //app.use(morgan('dev'));

// Read cookies (needed for authentication)
app.use(cookieParser());

// ## Get all data/stuff of the body (POST) parameters

// Parse application/json
app.use(bodyParser.json({limit: '50mb'}));
// Parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Override with the X-HTTP-Method-Override header in the request. Simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));
// Set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/dist'));

import Notebook from './app/models/notebook.model';
import Part from './app/models/part.model';
import User from './app/models/user.model';
import Document from './app/models/document.model';
import State from './app/models/state.model';

// import Recurly from 'node-recurly';

// let recurly = new Recurly({
//   API_KEY:      process.env.RECURLY_API_KEY,
//   SUBDOMAIN:    process.env.RECURLY_ACCOUNT_NAME,
//   ENVIRONMENT:  process.env.RECURLY_ACCOUNT_ENV,
//   DEBUG: false
// });

// var getAccount = Promise.promisify(recurly.accounts.get);
// var createAccount = Promise.promisify(recurly.accounts.create);


// User.findById("582f5d91f28dfe2d3c80d0d4")
// .then(function(user) {
//   user.billingInfo = {
//     firstName: 'Jesse',
//     lastName: 'James',
//     country: 'US',
//     city: 'Port Saint Lucie',
//     state: 'FL',
//     zip: '34983',
//     address1: '153 NE Sagamore Ter',
//     address2: '',
//     creditCardNumber: '4111-1111-1111-1111',
//     creditCardExpirationMonth: '1',
//     creditCardExpirationYear: '2024'
//   };

//   return user.subscribe();
// })
// .then(function(response) {
//   console.log('hree')
//   console.log(response.data);
// })
// .catch(function(err) {
//   console.log('err')
//   console.log(err.data);
// });


User.findOne({'local.email': 'dpjewett@gmail.com'})
.then( (user) => {
  if(!user) {
    let newUser = new User();
    newUser.role = 'admin';
    newUser.local.username = "dougj".toLowerCase();
    newUser.local.email = "dpjewett@gmail.com".toLowerCase();
    newUser.local.password = newUser.generateHash(process.env.ADMIN_PASSWORD);

    return newUser.save();
  } else {
    return user;
  }
})

State.count()
.then((count) => {
  if(count === 0) {
    return State.create([
    {
        "name": "Alabama",
        "abbreviation": "AL"
    },
    {
        "name": "Alaska",
        "abbreviation": "AK"
    },
    {
        "name": "American Samoa",
        "abbreviation": "AS"
    },
    {
        "name": "Arizona",
        "abbreviation": "AZ"
    },
    {
        "name": "Arkansas",
        "abbreviation": "AR"
    },
    {
        "name": "California",
        "abbreviation": "CA"
    },
    {
        "name": "Colorado",
        "abbreviation": "CO"
    },
    {
        "name": "Connecticut",
        "abbreviation": "CT"
    },
    {
        "name": "Delaware",
        "abbreviation": "DE"
    },
    {
        "name": "District Of Columbia",
        "abbreviation": "DC"
    },
    {
        "name": "Federated States Of Micronesia",
        "abbreviation": "FM"
    },
    {
        "name": "Florida",
        "abbreviation": "FL"
    },
    {
        "name": "Georgia",
        "abbreviation": "GA"
    },
    {
        "name": "Guam",
        "abbreviation": "GU"
    },
    {
        "name": "Hawaii",
        "abbreviation": "HI"
    },
    {
        "name": "Idaho",
        "abbreviation": "ID"
    },
    {
        "name": "Illinois",
        "abbreviation": "IL"
    },
    {
        "name": "Indiana",
        "abbreviation": "IN"
    },
    {
        "name": "Iowa",
        "abbreviation": "IA"
    },
    {
        "name": "Kansas",
        "abbreviation": "KS"
    },
    {
        "name": "Kentucky",
        "abbreviation": "KY"
    },
    {
        "name": "Louisiana",
        "abbreviation": "LA"
    },
    {
        "name": "Maine",
        "abbreviation": "ME"
    },
    {
        "name": "Marshall Islands",
        "abbreviation": "MH"
    },
    {
        "name": "Maryland",
        "abbreviation": "MD"
    },
    {
        "name": "Massachusetts",
        "abbreviation": "MA"
    },
    {
        "name": "Michigan",
        "abbreviation": "MI"
    },
    {
        "name": "Minnesota",
        "abbreviation": "MN"
    },
    {
        "name": "Mississippi",
        "abbreviation": "MS"
    },
    {
        "name": "Missouri",
        "abbreviation": "MO"
    },
    {
        "name": "Montana",
        "abbreviation": "MT"
    },
    {
        "name": "Nebraska",
        "abbreviation": "NE"
    },
    {
        "name": "Nevada",
        "abbreviation": "NV"
    },
    {
        "name": "New Hampshire",
        "abbreviation": "NH"
    },
    {
        "name": "New Jersey",
        "abbreviation": "NJ"
    },
    {
        "name": "New Mexico",
        "abbreviation": "NM"
    },
    {
        "name": "New York",
        "abbreviation": "NY"
    },
    {
        "name": "North Carolina",
        "abbreviation": "NC"
    },
    {
        "name": "North Dakota",
        "abbreviation": "ND"
    },
    {
        "name": "Northern Mariana Islands",
        "abbreviation": "MP"
    },
    {
        "name": "Ohio",
        "abbreviation": "OH"
    },
    {
        "name": "Oklahoma",
        "abbreviation": "OK"
    },
    {
        "name": "Oregon",
        "abbreviation": "OR"
    },
    {
        "name": "Palau",
        "abbreviation": "PW"
    },
    {
        "name": "Pennsylvania",
        "abbreviation": "PA"
    },
    {
        "name": "Puerto Rico",
        "abbreviation": "PR"
    },
    {
        "name": "Rhode Island",
        "abbreviation": "RI"
    },
    {
        "name": "South Carolina",
        "abbreviation": "SC"
    },
    {
        "name": "South Dakota",
        "abbreviation": "SD"
    },
    {
        "name": "Tennessee",
        "abbreviation": "TN"
    },
    {
        "name": "Texas",
        "abbreviation": "TX"
    },
    {
        "name": "Utah",
        "abbreviation": "UT"
    },
    {
        "name": "Vermont",
        "abbreviation": "VT"
    },
    {
        "name": "Virgin Islands",
        "abbreviation": "VI"
    },
    {
        "name": "Virginia",
        "abbreviation": "VA"
    },
    {
        "name": "Washington",
        "abbreviation": "WA"
    },
    {
        "name": "West Virginia",
        "abbreviation": "WV"
    },
    {
        "name": "Wisconsin",
        "abbreviation": "WI"
    },
    {
        "name": "Wyoming",
        "abbreviation": "WY"
    }
  ]);
  } else {
    return State.find();
  }
});


Notebook.count()
.then((count) => {
  if(count === 0) {
    return Notebook.create({});
  } else {
    return Notebook.findOne({}).populate('parts');
  }
})
.then((notebook) => {
  if(notebook.parts.length === 0) {
    let parts = [
      {title: "Part 1: Then", position: 1},
      {title: "Part 2: Now", position: 2},
      {title: "Part 3: Eternity", position: 3},
    ];

    return Promise.each(parts, (part) => {
      part.notebook = notebook._id;
      return Part.create(part)
    });
  } else {
    return Part.find({notebook: notebook});
  }
})
.then( ()=> {
  // console.log(arguments);
})
;

// ## Passport JS

// Session secret
// app.use(session({

//   secret : process.env.SESSION_SECRET,

//   resave : true,

//   saveUninitialized : true
// }));

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(passport.initialize());

// Persistent login sessions
app.use(passport.session());

// ## Routes

// Get an instance of the express Router
let router = express.Router();

// Load our application API routes
// Pass in our express and express router instances
import routes from './app/routes';

// Pass in instances of the express app, router, and passport
routes(app, router, passport);

// ### Ignition Phase

server.listen(port);

// Shoutout to the user
console.log(`Wizardry is afoot on port ${port}`);

// Expose app
export {app};
