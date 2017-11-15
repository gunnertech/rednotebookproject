'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bcryptNodejs = require('bcrypt-nodejs');

var _bcryptNodejs2 = _interopRequireDefault(_bcryptNodejs);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _nodeRecurly = require('node-recurly');

var _nodeRecurly2 = _interopRequireDefault(_nodeRecurly);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _sendgrid = require('sendgrid');

var _sendgrid2 = _interopRequireDefault(_sendgrid);

var _document = require('./document.model');

var _document2 = _interopRequireDefault(_document);

var _assignment = require('./assignment.model');

var _assignment2 = _interopRequireDefault(_assignment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Import library to hash passwords
var recurly = new _nodeRecurly2.default({
  API_KEY: process.env.RECURLY_API_KEY,
  SUBDOMAIN: process.env.RECURLY_ACCOUNT_NAME,
  ENVIRONMENT: process.env.RECURLY_ACCOUNT_ENV,
  DEBUG: false
});

// Define the schema for the showcase item
// ## User Model

// Note: MongoDB will autogenerate an _id for each User object created

// Grab the Mongoose module
var userSchema = _mongoose2.default.Schema({

  local: {
    username: { type: String, unique: true },
    password: String,
    email: { type: String, unique: true }
  },

  billingInfo: {
    firstName: String,
    lastName: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String
  },

  state: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'State' },
  states: [{ type: _mongoose2.default.Schema.Types.ObjectId, ref: 'State' }],
  assignments: [{ type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Assignment' }],
  responses: [{ type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Response' }],
  notifications: [{ type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Notification' }],

  recurlySubscriptionId: { type: String },
  recurlyAccountCode: { type: String },
  recurlyAccountStatus: { type: String, default: 'in_trial', enum: ['active', 'canceled', 'expired', 'future', 'in_trial', 'live', 'past_due'] },

  passwordResetToken: String,
  passwordResetTokenCreatedAt: Date,

  role: { type: String }
}, {
  timestamps: true
});

userSchema.pre('save', function (next) {
  if (this.state) {
    _mongoose2.default.model('User', userSchema).update({ _id: this._id }, { state: null, $addToSet: { states: this.state } }).then(function () {
      return next();
    }).error(function (err) {
      return next(err);
    });
  } else {
    next();
  }
});

userSchema.pre('save', function (next) {
  if (this.passwordResetToken && !this.password) {
    this.passwordResetTokenCreatedAt = new Date();
  } else if (this.password && this.passwordResetTokenCreatedAt) {
    this.passwordResetTokenCreatedAt = new Date();
    this.local.password = this.generateHash(this.password);
  }

  next();
});

userSchema.pre('save', function (next) {
  var self = this;

  _mongoose2.default.model('User', userSchema).count({}).then(function (count) {
    if (count === 0) {
      self.role = 'admin';
    }

    next();
  });
});

userSchema.pre('save', function (next) {
  this.recurlyAccountCode = 'recurly_rednotebook_' + this._id;
  next();
});

userSchema.post('save', function (user) {
  // ASSIGN DOCUMENTS TO THE NEW USER
  _document2.default.find().then(function (documents) {
    documents.forEach(function (document) {
      if (!document.state || document.state == user.state) {
        _assignment2.default.count({
          user: user._id,
          document: document._id
        }).then(function (count) {
          if (count === 0) {
            _assignment2.default.create({
              user: user._id,
              document: document._id
            }).then(function (assignments) {}).error(function (err) {
              return console.log(err);
            });
          }
        });
      }
    });
  });
});

userSchema.set('toObject', {
  getters: true,
  virtuals: true
});

userSchema.set('toJSON', {
  getters: true,
  virtuals: true
});

userSchema.virtual('billingInfo.creditCardNumber').set(function (creditCardNumber) {
  return this.billingInfo.number = creditCardNumber;
});

userSchema.virtual('billingInfo.creditCardNumber').get(function () {
  return this.billingInfo.number;
});

userSchema.virtual('billingInfo.creditCardExpirationMonth').set(function (creditCardExpirationMonth) {
  return this.billingInfo.month = creditCardExpirationMonth;
});

userSchema.virtual('billingInfo.creditCardExpirationMonth').get(function () {
  return this.billingInfo.month;
});

userSchema.virtual('billingInfo.creditCardExpirationYear').set(function (creditCardExpirationYear) {
  return this.billingInfo.year = creditCardExpirationYear;
});

userSchema.virtual('billingInfo.creditCardExpirationYear').get(function () {
  return this.billingInfo.year;
});

userSchema.virtual('hasValidSubscription').get(function () {
  if (this.recurlyAccountStatus == "active" || this.recurlyAccountStatus == "live") {
    return true;
  } else if (this.recurlyAccountStatus == "in_trial") {
    var today = (0, _moment2.default)().startOf('day');
    var accountStartDate = (0, _moment2.default)(this.createdAt || Date.now()).startOf('day');
    var daysBetween = today.diff(accountStartDate, 'days');

    return daysBetween < 31;
  }

  return false;
});

// ## Methods

// ### Generate a hash
userSchema.methods.generateHash = function (password) {

  return _bcryptNodejs2.default.hashSync(password, _bcryptNodejs2.default.genSaltSync(8), null);
};

userSchema.methods.generatePasswordResetToken = function () {
  this.passwordResetToken = _nodeUuid2.default.v4();
  return this.save();
};

userSchema.methods.sendPasswordResetEmail = function () {
  var _this = this;

  return this.generatePasswordResetToken().then(function () {
    var url = process.env.NODE_ENV == "production" ? 'http://com-gunnertech-rednotebook-production-client.s3-website-us-west-2.amazonaws.com/' : 'http://localhost:8100';

    var body = "Please open the app and when prompted, paste this code: " + _this.passwordResetToken + "\n\r\n\r";

    body += "The code will expire in 2 hours.";

    return _this.sendEmail("Reset your Red Notebook password", body);
  });
};

userSchema.methods.sendEmail = function (subject, body) {
  var sg = (0, _sendgrid2.default)(process.env.SENDGRID_API_KEY);

  var helper = _sendgrid2.default.mail;
  var from_email = new helper.Email("no-reply@rednotebook.com");
  var to_email = new helper.Email(this.local.email);
  var content = new helper.Content("text/plain", body);
  var mail = new helper.Mail(from_email, subject, to_email, content);

  var requestBody = mail.toJSON();

  var request = sg.emptyRequest();
  request.method = 'POST';
  request.path = '/v3/mail/send';
  request.body = requestBody;

  return new _bluebird2.default(function (resolve, reject) {
    sg.API(request, function (error, response) {
      if (error) {
        return reject(error);
      }

      return resolve(response);
    });
  });
};

userSchema.methods.subscribe = function () {
  var createSubscription = _bluebird2.default.promisify(recurly.subscriptions.create);
  var createAccount = _bluebird2.default.promisify(recurly.accounts.create);
  var getAccount = _bluebird2.default.promisify(recurly.accounts.get);
  var updateAccount = _bluebird2.default.promisify(recurly.accounts.update);
  var self = this;

  return getAccount(self.recurlyAccountCode).then(function (response) {
    return updateAccount(self.recurlyAccountCode, {
      first_name: self.billingInfo.firstName,
      last_name: self.billingInfo.lastName,
      email: self.local.email,
      billing_info: {
        first_name: self.billingInfo.firstName,
        last_name: self.billingInfo.lastName,
        country: 'US',
        city: self.billingInfo.city,
        state: self.billingInfo.state,
        zip: self.billingInfo.zip,
        address1: self.billingInfo.address1,
        address2: self.billingInfo.address2,
        number: self.billingInfo.creditCardNumber,
        month: self.billingInfo.creditCardExpirationMonth,
        year: self.billingInfo.creditCardExpirationYear
      },
      address: {
        country: 'US',
        city: self.billingInfo.city,
        state: self.billingInfo.state,
        zip: self.billingInfo.zip,
        address1: self.billingInfo.address1,
        address2: self.billingInfo.address2
      }
    });
  }).catch(function (err) {
    return createAccount({
      account_code: self.recurlyAccountCode,
      first_name: self.billingInfo.firstName,
      last_name: self.billingInfo.lastName,
      email: self.local.email,
      billing_info: {
        first_name: self.billingInfo.firstName,
        last_name: self.billingInfo.lastName,
        country: 'US',
        city: self.billingInfo.city,
        state: self.billingInfo.state,
        zip: self.billingInfo.zip,
        address1: self.billingInfo.address1,
        address2: self.billingInfo.address2,
        number: self.billingInfo.creditCardNumber,
        month: self.billingInfo.creditCardExpirationMonth,
        year: self.billingInfo.creditCardExpirationYear
      },
      address: {
        country: 'US',
        city: self.billingInfo.city,
        state: self.billingInfo.state,
        zip: self.billingInfo.zip,
        address1: self.billingInfo.address1,
        address2: self.billingInfo.address2
      }
    });
  }).then(function (response) {
    var obj = {
      plan_code: process.env.RECURLY_SUBSCRIPTION_CODE,
      currency: 'USD',
      customer_notes: 'Thank you!',
      account: {
        account_code: self.recurlyAccountCode
      }
    };

    return createSubscription(obj).catch(function (err) {
      console.log(err.data);
    });
  });
};

// ### Check if password is valid
userSchema.methods.validPassword = function (password) {

  return _bcryptNodejs2.default.compareSync(password, this.local.password);
};

// Create the model for users and expose it to the app
exports.default = _mongoose2.default.model('User', userSchema);