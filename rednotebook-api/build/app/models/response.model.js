'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _user = require('./user.model');

var _user2 = _interopRequireDefault(_user);

var _input = require('./input.model');

var _input2 = _interopRequireDefault(_input);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var responseSchema = new _mongoose2.default.Schema({
	value: { type: String },
	user: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'User' },
	input: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Input' },
	isEncrypted: {
		type: Boolean,
		required: true,
		default: false
	}
});

responseSchema.virtual('encryptionKey').get(function () {
	return this._encryptionKey;
});

responseSchema.virtual('encryptionKey').set(function (encryptionKey) {
	return this._encryptionKey = encryptionKey;
});

responseSchema.virtual('decryptedValue').get(function () {
	var encryptionKey = this._encryptionKey;
	if (!this.isEncrypted || !encryptionKey) {
		return this.value;
	}

	var algorithm = 'aes-256-ctr';
	var decipher = _crypto2.default.createDecipher(algorithm, encryptionKey);

	var dec = decipher.update(this.value, 'hex', 'utf8');
	dec += decipher.final('utf8');

	return dec;
});

responseSchema.set('toObject', {
	getters: true,
	virtuals: true
});

responseSchema.set('toJSON', {
	getters: true,
	virtuals: true
});

responseSchema.pre('save', function (next) {
	var self = this;

	_input2.default.findById(self.input).then(function (input) {
		if (input.requiresEncryption) {
			var algorithm = 'aes-256-ctr';
			var cipher = _crypto2.default.createCipher(algorithm, self._encryptionKey);
			var crypted = cipher.update(self.value, 'utf8', 'hex');

			crypted += cipher.final('hex');
			self.isEncrypted = true;
			self.value = crypted;
		}
		next();
	});
});

responseSchema.pre('save', function (next) {
	_input2.default.update({ _id: this.input }, { $addToSet: { responses: this._id } }).then(function (inputs) {
		return next();
	}).error(function (err) {
		return next(err);
	});
});

responseSchema.pre('save', function (next) {
	_user2.default.update({ _id: this.user }, { $addToSet: { responses: this._id } }).then(function (users) {
		return next();
	}).error(function (err) {
		return next(err);
	});
});

responseSchema.pre('remove', function (next) {
	_input2.default.update({ _id: this.input }, { $pullAll: { responses: [this._id] } }).then(function (inputs) {
		return next();
	}).error(function (err) {
		return next(err);
	});
});

responseSchema.pre('remove', function (next) {
	_user2.default.update({ _id: this.user }, { $pullAll: { responses: [this._id] } }).then(function (users) {
		return next();
	}).error(function (err) {
		return next(err);
	});
});

exports.default = _mongoose2.default.model('Response', responseSchema);