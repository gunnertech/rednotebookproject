'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _user = require('./user.model');

var _user2 = _interopRequireDefault(_user);

var _document = require('./document.model');

var _document2 = _interopRequireDefault(_document);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assignmentSchema = new _mongoose2.default.Schema({
	completedAt: { type: Date },
	user: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'User' },
	document: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Document' }
});

assignmentSchema.pre('save', function (next) {
	_bluebird2.default.all([_user2.default.update({ _id: this.user }, { $addToSet: { assignments: this._id } }), _document2.default.update({ _id: this.document }, { $addToSet: { assignments: this._id } })]).then(function () {
		return next();
	}).error(function (err) {
		return next(err);
	});
});

assignmentSchema.pre('remove', function (next) {
	_bluebird2.default.all([_user2.default.update({ _id: this.user }, { $pullAll: { assignments: [this._id] } }), _document2.default.update({ _id: this.document }, { $pullAll: { assignments: [this._id] } })]).then(function () {
		return next();
	}).error(function (err) {
		return next(err);
	});
});

exports.default = _mongoose2.default.model('Assignment', assignmentSchema);