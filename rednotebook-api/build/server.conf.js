'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.app = undefined;

var _envConf = require('./config/env.conf.js');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _methodOverride = require('method-override');

var _methodOverride2 = _interopRequireDefault(_methodOverride);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _cookieSession = require('cookie-session');

var _cookieSession2 = _interopRequireDefault(_cookieSession);

var _base = require('./sockets/base');

var _base2 = _interopRequireDefault(_base);

var _mongooseConf = require('./config/mongoose.conf.js');

var _mongooseConf2 = _interopRequireDefault(_mongooseConf);

var _passportConf = require('./config/passport.conf.js');

var _passportConf2 = _interopRequireDefault(_passportConf);

var _notebook = require('./app/models/notebook.model');

var _notebook2 = _interopRequireDefault(_notebook);

var _part = require('./app/models/part.model');

var _part2 = _interopRequireDefault(_part);

var _user = require('./app/models/user.model');

var _user2 = _interopRequireDefault(_user);

var _document = require('./app/models/document.model');

var _document2 = _interopRequireDefault(_document);

var _state = require('./app/models/state.model');

var _state2 = _interopRequireDefault(_state);

var _routes = require('./app/routes');

var _routes2 = _interopRequireDefault(_routes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Set up appropriate environment variables if necessary
(0, _envConf.validateEnvVariables)();

// # Modules

// Load Express
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

// Load Socket.io

// Load Node http module

// Create our app with Express
var app = (0, _express2.default)();
// Create a Node server for our Express app
var server = _http2.default.createServer(app);
// Integrate Socket.io
var io = _socket2.default.listen(server);
// Load Mongoose for MongoDB interactions

_mongoose2.default.Promise = _bluebird2.default;

// Log requests to the console (Express 4)
//if (process.env.NODE_ENV == 'development') {
//var morgan = require('morgan');
//import morgan from 'morgan';
//}

// Pull information from HTML POST (express 4)

// Simulate DELETE and PUT (Express 4)

// PassportJS


// # Configuration

// Load Socket.io server functionality


// base(io);

// Set the port for this app
var port = process.env.PORT || 8080;

// Load Mongoose config file for connecting to MongoDB instance


// Pass Mongoose configuration Mongoose instance
(0, _mongooseConf2.default)(_mongoose2.default);

// Import PassportJS configuration


// Pass Passport configuration our PassportJS instance
(0, _passportConf2.default)(_passport2.default);

//if (process.env.NODE_ENV === 'development' ||
//   process.env.NODE_ENV === 'test')
// Log every request to the console
//app.use(morgan('dev'));

// Read cookies (needed for authentication)
app.use((0, _cookieParser2.default)());

// ## Get all data/stuff of the body (POST) parameters

// Parse application/json
app.use(_bodyParser2.default.json({ limit: '50mb' }));
// Parse application/vnd.api+json as json
app.use(_bodyParser2.default.json({ type: 'application/vnd.api+json' }));
// Parse application/x-www-form-urlencoded
app.use(_bodyParser2.default.urlencoded({ extended: true, limit: '50mb' }));

// Override with the X-HTTP-Method-Override header in the request. Simulate DELETE/PUT
app.use((0, _methodOverride2.default)('X-HTTP-Method-Override'));
// Set the static files location /public/img will be /img for users
app.use(_express2.default.static(__dirname + '/dist'));

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


_user2.default.findOne({ 'local.email': 'dpjewett@gmail.com' }).then(function (user) {
    if (!user) {
        var newUser = new _user2.default();
        newUser.role = 'admin';
        newUser.local.username = "dougj".toLowerCase();
        newUser.local.email = "dpjewett@gmail.com".toLowerCase();
        newUser.local.password = newUser.generateHash(process.env.ADMIN_PASSWORD);

        return newUser.save();
    } else {
        return user;
    }
});

_state2.default.count().then(function (count) {
    if (count === 0) {
        return _state2.default.create([{
            "name": "Alabama",
            "abbreviation": "AL"
        }, {
            "name": "Alaska",
            "abbreviation": "AK"
        }, {
            "name": "American Samoa",
            "abbreviation": "AS"
        }, {
            "name": "Arizona",
            "abbreviation": "AZ"
        }, {
            "name": "Arkansas",
            "abbreviation": "AR"
        }, {
            "name": "California",
            "abbreviation": "CA"
        }, {
            "name": "Colorado",
            "abbreviation": "CO"
        }, {
            "name": "Connecticut",
            "abbreviation": "CT"
        }, {
            "name": "Delaware",
            "abbreviation": "DE"
        }, {
            "name": "District Of Columbia",
            "abbreviation": "DC"
        }, {
            "name": "Federated States Of Micronesia",
            "abbreviation": "FM"
        }, {
            "name": "Florida",
            "abbreviation": "FL"
        }, {
            "name": "Georgia",
            "abbreviation": "GA"
        }, {
            "name": "Guam",
            "abbreviation": "GU"
        }, {
            "name": "Hawaii",
            "abbreviation": "HI"
        }, {
            "name": "Idaho",
            "abbreviation": "ID"
        }, {
            "name": "Illinois",
            "abbreviation": "IL"
        }, {
            "name": "Indiana",
            "abbreviation": "IN"
        }, {
            "name": "Iowa",
            "abbreviation": "IA"
        }, {
            "name": "Kansas",
            "abbreviation": "KS"
        }, {
            "name": "Kentucky",
            "abbreviation": "KY"
        }, {
            "name": "Louisiana",
            "abbreviation": "LA"
        }, {
            "name": "Maine",
            "abbreviation": "ME"
        }, {
            "name": "Marshall Islands",
            "abbreviation": "MH"
        }, {
            "name": "Maryland",
            "abbreviation": "MD"
        }, {
            "name": "Massachusetts",
            "abbreviation": "MA"
        }, {
            "name": "Michigan",
            "abbreviation": "MI"
        }, {
            "name": "Minnesota",
            "abbreviation": "MN"
        }, {
            "name": "Mississippi",
            "abbreviation": "MS"
        }, {
            "name": "Missouri",
            "abbreviation": "MO"
        }, {
            "name": "Montana",
            "abbreviation": "MT"
        }, {
            "name": "Nebraska",
            "abbreviation": "NE"
        }, {
            "name": "Nevada",
            "abbreviation": "NV"
        }, {
            "name": "New Hampshire",
            "abbreviation": "NH"
        }, {
            "name": "New Jersey",
            "abbreviation": "NJ"
        }, {
            "name": "New Mexico",
            "abbreviation": "NM"
        }, {
            "name": "New York",
            "abbreviation": "NY"
        }, {
            "name": "North Carolina",
            "abbreviation": "NC"
        }, {
            "name": "North Dakota",
            "abbreviation": "ND"
        }, {
            "name": "Northern Mariana Islands",
            "abbreviation": "MP"
        }, {
            "name": "Ohio",
            "abbreviation": "OH"
        }, {
            "name": "Oklahoma",
            "abbreviation": "OK"
        }, {
            "name": "Oregon",
            "abbreviation": "OR"
        }, {
            "name": "Palau",
            "abbreviation": "PW"
        }, {
            "name": "Pennsylvania",
            "abbreviation": "PA"
        }, {
            "name": "Puerto Rico",
            "abbreviation": "PR"
        }, {
            "name": "Rhode Island",
            "abbreviation": "RI"
        }, {
            "name": "South Carolina",
            "abbreviation": "SC"
        }, {
            "name": "South Dakota",
            "abbreviation": "SD"
        }, {
            "name": "Tennessee",
            "abbreviation": "TN"
        }, {
            "name": "Texas",
            "abbreviation": "TX"
        }, {
            "name": "Utah",
            "abbreviation": "UT"
        }, {
            "name": "Vermont",
            "abbreviation": "VT"
        }, {
            "name": "Virgin Islands",
            "abbreviation": "VI"
        }, {
            "name": "Virginia",
            "abbreviation": "VA"
        }, {
            "name": "Washington",
            "abbreviation": "WA"
        }, {
            "name": "West Virginia",
            "abbreviation": "WV"
        }, {
            "name": "Wisconsin",
            "abbreviation": "WI"
        }, {
            "name": "Wyoming",
            "abbreviation": "WY"
        }]);
    } else {
        return _state2.default.find();
    }
});

_notebook2.default.count().then(function (count) {
    if (count === 0) {
        return _notebook2.default.create({});
    } else {
        return _notebook2.default.findOne({}).populate('parts');
    }
}).then(function (notebook) {
    if (notebook.parts.length === 0) {
        var parts = [{ title: "Part 1: Then", position: 1 }, { title: "Part 2: Now", position: 2 }, { title: "Part 3: Eternity", position: 3 }];

        return _bluebird2.default.each(parts, function (part) {
            part.notebook = notebook._id;
            return _part2.default.create(part);
        });
    } else {
        return _part2.default.find({ notebook: notebook });
    }
}).then(function () {
    // console.log(arguments);
});

// ## Passport JS

// Session secret
// app.use(session({

//   secret : process.env.SESSION_SECRET,

//   resave : true,

//   saveUninitialized : true
// }));

app.use((0, _cookieSession2.default)({
    name: 'session',
    keys: [process.env.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(_passport2.default.initialize());

// Persistent login sessions
app.use(_passport2.default.session());

// ## Routes

// Get an instance of the express Router
var router = _express2.default.Router();

// Load our application API routes
// Pass in our express and express router instances


// Pass in instances of the express app, router, and passport
(0, _routes2.default)(app, router, _passport2.default);

// ### Ignition Phase

server.listen(port);

// Shoutout to the user
console.log('Wizardry is afoot on port ' + port);

// Expose app
exports.app = app;