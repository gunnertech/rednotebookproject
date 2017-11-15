'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _document = require('./document.model');

var _document2 = _interopRequireDefault(_document);

var _notebook = require('./notebook.model');

var _notebook2 = _interopRequireDefault(_notebook);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var partSchema = new _mongoose2.default.Schema({
	title: {
		type: String,
		required: true
	},
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
	notebook: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Notebook' },
	documents: [{ type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Document' }]
});

partSchema.pre('save', function (next) {
	_notebook2.default.update({ _id: this.notebook }, { $addToSet: { parts: this._id } }).then(function (notebooks) {
		return next();
	}).error(function (err) {
		return next(err);
	});
});

partSchema.pre('remove', function (next) {
	_notebook2.default.update({ _id: this.notebook }, { $pullAll: { parts: [this._id] } }).then(function (notebooks) {
		return next();
	}).error(function (err) {
		return next(err);
	});
});

partSchema.post('save', function (part) {
	_mongoose2.default.model('Part', partSchema).find({ position: part.position, _id: { $ne: part._id }, notebook: part.notebook }).then(function (parts) {
		return _bluebird2.default.each(parts, function (part) {
			part.position++;
			return part.save();
		});
	}).error(function (err) {
		return console.log(err);
	});
});

exports.default = _mongoose2.default.model('Part', partSchema);