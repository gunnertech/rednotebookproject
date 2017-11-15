'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _part = require('./part.model');

var _part2 = _interopRequireDefault(_part);

var _section = require('./section.model');

var _section2 = _interopRequireDefault(_section);

var _state = require('./state.model');

var _state2 = _interopRequireDefault(_state);

var _assignment = require('./assignment.model');

var _assignment2 = _interopRequireDefault(_assignment);

var _user = require('./user.model');

var _user2 = _interopRequireDefault(_user);

var _notification = require('./notification.model');

var _notification2 = _interopRequireDefault(_notification);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var documentSchema = new _mongoose2.default.Schema({
	title: { type: String },
	position: {
		type: Number,
		required: true,
		get: function get(v) {
			return Math.round(v);
		},
		set: function set(v) {
			return Math.round(v);
		}
	},
	part: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Part' },
	sections: [{ type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Section' }],
	state: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'State' },
	isOngoing: {
		type: Boolean,
		required: true,
		default: false
	},
	assignments: [{ type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Assignment' }]
});

documentSchema.virtual('sendNotification').get(function () {
	return this._sendNotification;
});

documentSchema.virtual('sendNotification').set(function (sendNotification) {
	return this._sendNotification = sendNotification;
});

documentSchema.set('toObject', {
	getters: true
});

documentSchema.pre('save', function (next) {
	var self = this;
	_part2.default.update({ documents: self._id }, { $pullAll: { documents: [self._id] } }).then(function (parts) {
		return _part2.default.update({ _id: self.part }, { $addToSet: { documents: self._id } }).then(function (parts) {
			next();return null;
		}).error(function (err) {
			return next(err);
		});
	});
});

//WHEN A DOCUMENT IS SAVED, WE NEED TO POTENTIALLY CREATE NEW ASSIGNMENTS FOR IT
documentSchema.post('save', function (document) {
	var Document = _mongoose2.default.model('Document', documentSchema);
	var states = document.state ? [null, document.state] : [null];

	states.forEach(function (state) {
		Document.find({ state: null }).then(function (documents) {
			return [documents, state ? _user2.default.find({ state: state }) : _user2.default.find()];
		}).spread(function (documents, users) {
			documents.forEach(function (document) {
				users.forEach(function (user) {
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
				});
			});
		});
	});
});

//WHEN SAVED, IF THE ADMIN WANTS TO NOTIFY USERS ABOUT THE CHANGE, CREATE NOTIFICATIONS
documentSchema.post('save', function (document) {
	if (document.sendNotification) {
		setTimeout(function () {
			_assignment2.default.find({ document: document._id }).then(function (assignments) {
				assignments.forEach(function (assignment) {
					_notification2.default.create({
						user: assignment.user,
						message: document.title + ' has been updated',
						data: {
							type: "Document",
							id: document._id
						}
					}).then(function () {});
				});
			});
		}, 4000);
	}
});

documentSchema.pre('remove', function (next) {
	_part2.default.update({ _id: this.part }, { $pullAll: { documents: [this._id] } }).then(function (parts) {
		return next();
	}).error(function (err) {
		return next(err);
	});
});

documentSchema.post('save', function (document) {
	_mongoose2.default.model('Document', documentSchema).find({ position: document.position, _id: { $ne: document._id }, part: document.part }).then(function (documents) {
		return _bluebird2.default.each(documents, function (document) {
			document.position++;
			return document.save();
		});
	}).error(function (err) {
		return console.log(err);
	});
});

exports.default = _mongoose2.default.model('Document', documentSchema);