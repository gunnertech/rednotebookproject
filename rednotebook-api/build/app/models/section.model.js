'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _document = require('./document.model');

var _document2 = _interopRequireDefault(_document);

var _input = require('./input.model');

var _input2 = _interopRequireDefault(_input);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sectionSchema = new _mongoose2.default.Schema({
	title: { type: String },
	description: { type: String },
	repeatable: {
		type: Boolean,
		default: false
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
	document: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Document' },
	master: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Section' },
	children: [{ type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Section' }],
	inputs: [{ type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Input' }]
});

sectionSchema.pre('save', function (next) {
	var Section = _mongoose2.default.model('Section', sectionSchema);
	(this.master ? Section.update({ _id: this.master }, { $addToSet: { children: this._id } }) : _document2.default.update({ _id: this.document }, { $addToSet: { sections: this._id } })).then(function (documents) {
		return next();
	}).error(function (err) {
		return next(err);
	});
});

sectionSchema.post('save', function (section) {
	if (section.repeatable && section.children.length < 50) {
		var Section = _mongoose2.default.model('Section', sectionSchema);
		for (var i = 1; i <= 50; i++) {
			var newSection = new Section();
			newSection.master = section._id;
			newSection.position = i;
			newSection.title = section.title;
			newSection.description = section.description;

			newSection.save();
		}
	}
});

sectionSchema.post('save', function (section) {
	//sync all the sections inputs
	if (section.master) {
		var Section = _mongoose2.default.model('Section', sectionSchema);
		Section.findById(section.master).populate('inputs').then(function (section) {
			section.inputs.forEach(function (input) {
				_input2.default.findOne({ clonedFrom: input._id, section: section._id }).then(function (clonedInput) {
					clonedInput = clonedInput || new _input2.default();
					if (clonedInput.syncWith(input)) {
						clonedInput.save();
					}
				});
			});
		});
	}
});

sectionSchema.post('save', function (section) {
	var Section = _mongoose2.default.model('Section', sectionSchema);
	if (section.children) {
		Section.find({ _id: { $in: section.children } }).then(function (children) {
			children.forEach(function (child) {
				if (child.syncWith(section)) {
					child.save();
				}
			});
		});
	}
});

sectionSchema.pre('remove', function (next) {
	var Section = _mongoose2.default.model('Section', sectionSchema);
	(this.master ? Section.update({ _id: this.master }, { $pullAll: { children: [this._id] } }) : _document2.default.update({ _id: this.document }, { $pullAll: { sections: [this._id] } })).then(function (documents) {
		return next();
	}).error(function (err) {
		return next(err);
	});
});

sectionSchema.post('save', function (section) {
	var query = { position: section.position, _id: { $ne: section._id } };
	var Section = _mongoose2.default.model('Section', sectionSchema);
	query[section.master ? 'master' : 'document'] = section.master || section.document;

	Section.find(query).then(function (sections) {
		return _bluebird2.default.each(sections, function (section) {
			section.position++;
			return section.save();
		});
	}).error(function (err) {
		return console.log(err);
	});
});

sectionSchema.methods.syncWith = function (section) {
	var self = this;
	var didChange = false;

	['title', 'description'].forEach(function (prop) {
		if (self[prop] != section[prop]) {
			didChange = true;
			self[prop] = section[prop];
		}
	});

	return didChange;
};

exports.default = _mongoose2.default.model('Section', sectionSchema);