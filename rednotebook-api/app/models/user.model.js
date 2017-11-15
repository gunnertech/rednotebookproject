// ## User Model

// Note: MongoDB will autogenerate an _id for each User object created

// Grab the Mongoose module
import mongoose from 'mongoose';

// Import library to hash passwords
import bcrypt from 'bcrypt-nodejs';
import moment from 'moment';
import Recurly from 'node-recurly';
import Promise from 'bluebird';

import uuid from 'node-uuid';
import sendgrid from 'sendgrid';

import Document from './document.model';
import Assignment from './assignment.model';



let recurly = new Recurly({
  API_KEY:      process.env.RECURLY_API_KEY,
  SUBDOMAIN:    process.env.RECURLY_ACCOUNT_NAME,
  ENVIRONMENT:  process.env.RECURLY_ACCOUNT_ENV,
  DEBUG: false
});

// Define the schema for the showcase item
let userSchema = mongoose.Schema({

  local : {
    username : { type : String, unique : true },
    password : String,
    email : { type : String, unique : true }
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

  state: {type: mongoose.Schema.Types.ObjectId, ref:'State'},
  states: [{type: mongoose.Schema.Types.ObjectId, ref:'State'}],
  assignments: [{type: mongoose.Schema.Types.ObjectId, ref:'Assignment'}],
  responses: [{type: mongoose.Schema.Types.ObjectId, ref:'Response'}],
  notifications: [{type: mongoose.Schema.Types.ObjectId, ref:'Notification'}],
  
  recurlySubscriptionId : { type : String },
  recurlyAccountCode : { type : String },
  recurlyAccountStatus : { type : String, default: 'in_trial', enum : ['active', 'canceled', 'expired', 'future', 'in_trial', 'live', 'past_due'] },

  passwordResetToken: String,
  passwordResetTokenCreatedAt: Date,

  role : { type : String }
}, {
  timestamps: true
});

userSchema.pre('save', function (next) {
  if(this.state) {
    mongoose.model('User', userSchema).update( {_id: this._id}, { state: null, $addToSet: {states: this.state } } )
    .then(( () => next() ))
    .error(( (err) => next(err) ));
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
  
  mongoose.model('User', userSchema).count({})
  .then(function (count) {
    if(count === 0) {
      self.role = 'admin';
    }

    next();
  });
});

userSchema.pre('save', function (next) {
  this.recurlyAccountCode = `recurly_rednotebook_${this._id}`;
  next();
});

userSchema.post('save', function (user) { // ASSIGN DOCUMENTS TO THE NEW USER
  Document.find()
  .then(function(documents) {
    documents.forEach(function(document) {
      if(!document.state || document.state == user.state) {
        Assignment.count({
          user: user._id,
          document: document._id
        })
        .then(function(count) {
          if(count === 0) {
            Assignment.create({
              user: user._id,
              document: document._id
            })
            .then(( (assignments) => {} )) 
            .error(( (err) => console.log(err) ))
            ;
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

userSchema.virtual('billingInfo.creditCardNumber').set(function(creditCardNumber) {
  return this.billingInfo.number = creditCardNumber;
});

userSchema.virtual('billingInfo.creditCardNumber').get(function() {
  return this.billingInfo.number;
});

userSchema.virtual('billingInfo.creditCardExpirationMonth').set(function(creditCardExpirationMonth) {
  return this.billingInfo.month = creditCardExpirationMonth;
});

userSchema.virtual('billingInfo.creditCardExpirationMonth').get(function() {
  return this.billingInfo.month;
});

userSchema.virtual('billingInfo.creditCardExpirationYear').set(function(creditCardExpirationYear) {
  return this.billingInfo.year = creditCardExpirationYear;
});

userSchema.virtual('billingInfo.creditCardExpirationYear').get(function() {
  return this.billingInfo.year;
});

userSchema.virtual('hasValidSubscription').get(function() {
  if(this.recurlyAccountStatus == "active" || this.recurlyAccountStatus == "live") {
    return true;
  } else if(this.recurlyAccountStatus == "in_trial") {
    var today = moment().startOf('day');
    var accountStartDate = moment(this.createdAt || Date.now() ).startOf('day');
    var daysBetween = today.diff(accountStartDate,'days');

    return daysBetween < 31;
  }

  return false;
});

// ## Methods

// ### Generate a hash
userSchema.methods.generateHash = function(password) {

  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.generatePasswordResetToken = function() {
  this.passwordResetToken = uuid.v4();
  return this.save();
};

userSchema.methods.sendPasswordResetEmail = function() {
  return this.generatePasswordResetToken()
  .then(() => {
    var url = process.env.NODE_ENV == "production" ? 'http://com-gunnertech-rednotebook-production-client.s3-website-us-west-2.amazonaws.com/' : 'http://localhost:8100';

    var body = "Please open the app and when prompted, paste this code: " + this.passwordResetToken + "\n\r\n\r";

    body += "The code will expire in 2 hours."
    
    return this.sendEmail("Reset your Red Notebook password", body);
  });
};

userSchema.methods.sendEmail = function(subject, body) {
  var sg = sendgrid(process.env.SENDGRID_API_KEY)

  var helper = sendgrid.mail;
  var from_email = new helper.Email("no-reply@rednotebook.com");
  var to_email = new helper.Email(this.local.email);
  var content = new helper.Content("text/plain", body);
  var mail = new helper.Mail(from_email, subject, to_email, content);

  var requestBody = mail.toJSON();

  var request = sg.emptyRequest();
  request.method = 'POST';
  request.path = '/v3/mail/send';
  request.body = requestBody;

  return new Promise((resolve, reject) => {
    sg.API(request, function (error, response) {
      if (error) {
        return reject(error);
      }

      return resolve(response);
    });
  });
};


userSchema.methods.subscribe = function() {
  var createSubscription = Promise.promisify(recurly.subscriptions.create);
  var createAccount = Promise.promisify(recurly.accounts.create);
  var getAccount = Promise.promisify(recurly.accounts.get);
  var updateAccount = Promise.promisify(recurly.accounts.update);
  var self = this;

  return getAccount(self.recurlyAccountCode)
  .then(function(response) {
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
  })
  .catch(function(err) {
    return createAccount({
      account_code: (self.recurlyAccountCode),
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
  })
  .then(function(response) {
    var obj = {
      plan_code: process.env.RECURLY_SUBSCRIPTION_CODE,
      currency: 'USD',
      customer_notes: 'Thank you!',
      account: {
        account_code: self.recurlyAccountCode
      }
    };

    return createSubscription(obj).catch(function(err){ console.log(err.data); });
  });
};

// ### Check if password is valid
userSchema.methods.validPassword = function(password) {

  return bcrypt.compareSync(password, this.local.password);
};

// Create the model for users and expose it to the app
export default mongoose.model('User', userSchema);
