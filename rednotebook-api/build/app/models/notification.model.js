'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _user = require('./user.model');

var _user2 = _interopRequireDefault(_user);

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var notificationSchema = new _mongoose2.default.Schema({
	seenAt: { type: Date },
	openedAt: { type: Date },
	user: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'User' },
	message: String,
	data: Object
}, {
	timestamps: true
});

notificationSchema.methods.url = function () {
	return 'https://rednotebookproject.com/documents/' + this.data.id;
};

notificationSchema.methods.sendEmail = function () {
	var self = this;
	var smtpConfig = {
		host: 'smtp.gmail.com',
		port: 465,
		secure: true, // use SSL
		auth: {
			user: 'cody.swann@gmail.com',
			pass: '*****'
		}
	};

	var transporter = _nodemailer2.default.createTransport(smtpConfig);

	return _user2.default.findById(self.user).then(function (user) {
		return transporter.sendMail({
			from: 'no-reply@rednotebookproject.com',
			to: user.email,
			subject: "New Message from your Red Notebook",
			text: self.message + '\n\n' + self.url()
		});
	});
};

notificationSchema.pre('save', function (next) {
	_user2.default.update({ _id: this.user }, { $addToSet: { notifications: this._id } }).then(function (users) {
		return next();
	}).error(function (err) {
		return next(err);
	});
});

notificationSchema.post('save', function (notification) {
	// notification.sendEmail()
	// .then(function() {
	// 	console.log(arguments);
	// })
	// .catch(function() {
	// 	console.log(arguments);
	// })
	// ;
});

exports.default = _mongoose2.default.model('Notification', notificationSchema);