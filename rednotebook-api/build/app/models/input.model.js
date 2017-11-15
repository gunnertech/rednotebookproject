'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _response = require('./response.model');

var _response2 = _interopRequireDefault(_response);

var _section = require('./section.model');

var _section2 = _interopRequireDefault(_section);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var inputSchema = new _mongoose2.default.Schema({
	label: { type: String },
	placeholder: { type: String },
	description: { type: String },
	dataType: {
		type: String,
		enum: ["File", "Short Text", "Number", "Percentage", "Long Text", "Date"]
	},
	choices: {
		type: String
	},
	documentUrl: { type: String },
	allowMultipleChoiceSelections: {
		type: Boolean,
		required: true,
		default: false
	},
	repeatable: {
		type: Boolean,
		required: true,
		default: false
	},
	requiresEncryption: {
		type: Boolean,
		required: true,
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
	section: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Section' },
	master: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Input' },
	children: [{ type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Input' }],
	responses: [{ type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Response' }],
	clonedFrom: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Input' }
});

inputSchema.pre('save', function (next) {
	var Input = _mongoose2.default.model('Input', inputSchema);
	(this.master ? Input.update({ _id: this.master }, { $addToSet: { children: this._id } }) : _section2.default.update({ _id: this.section }, { $addToSet: { inputs: this._id } })).then(function (sections) {
		return next();
	}).error(function (err) {
		return next(err);
	});
});

inputSchema.post('save', function (input) {
	var Input = _mongoose2.default.model('Input', inputSchema);
	if (input.clonedFrom) {
		Input.findById(input.clonedFrom).then(function (masterInput) {
			if (masterInput && input.syncWith(masterInput)) {
				input.save();
			}
		});
	}
});

inputSchema.post('save', function (input) {
	var Input = _mongoose2.default.model('Input', inputSchema);
	_section2.default.findById(input.section).populate(['inputs', 'children']).then(function (section) {
		if (!section.master) {
			section.children.forEach(function (childSection) {
				Input.findOne({ clonedFrom: input._id, section: section._id }).then(function (clonedInput) {
					clonedInput = clonedInput || new Input();
					clonedInput.position = input.position;
					clonedInput.section = childSection;
					clonedInput.clonedFrom = input._id;

					if (input && clonedInput.syncWith(input)) {
						clonedInput.save();
					}
				});
			});
		}
	});
});

inputSchema.post('save', function (input) {
	if (input.repeatable && input.children.length < 50) {
		var Input = _mongoose2.default.model('Input', inputSchema);
		for (var i = 1; i <= 50; i++) {
			var newInput = new Input();
			newInput.master = input._id;
			newInput.position = i;
			newInput.requiresEncryption = input.requiresEncryption;
			newInput.label = input.label;
			newInput.description = input.description;
			newInput.dataType = input.dataType;
			newInput.choices = input.choices;
			newInput.documentUrl = input.documentUrl;
			newInput.allowMultipleChoiceSelections = input.allowMultipleChoiceSelections;

			newInput.save();
		}
	}
});

inputSchema.pre('remove', function (next) {
	var Input = _mongoose2.default.model('Input', inputSchema);
	(this.master ? Input.update({ _id: this.master }, { $pullAll: { children: [this._id] } }) : _section2.default.update({ _id: this.section }, { $pullAll: { inputs: [this._id] } })).then(function (sections) {
		return next();
	}).error(function (err) {
		return next(err);
	});
});

inputSchema.post('remove', function (input) {
	var Input = _mongoose2.default.model('Input', inputSchema);
	Input.remove({ clonedFrom: input._id }).then(function () {
		next();
	});
});

inputSchema.post('save', function (input) {
	var query = { position: input.position, _id: { $ne: input._id } };
	var Input = _mongoose2.default.model('Input', inputSchema);
	query[input.master ? 'master' : 'section'] = input.master || input.section;

	Input.find(query).then(function (inputs) {
		return _bluebird2.default.each(inputs, function (input) {
			input.position++;
			return input.save();
		});
	}).error(function (err) {
		return console.log(err);
	});
});

inputSchema.methods.syncWith = function (input) {
	var self = this;
	var didChange = false;
	['label', 'placeholder', 'description', 'dataType', 'choices', 'documentUrl', 'allowMultipleChoiceSelections', 'requiresEncryption'].forEach(function (prop) {
		if (self[prop] != input[prop]) {
			didChange = true;
			self[prop] = input[prop];
		}
	});

	return didChange;
};

exports.default = _mongoose2.default.model('Input', inputSchema);