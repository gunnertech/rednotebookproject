'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var notebookSchema = new _mongoose2.default.Schema({
  parts: [{ type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Part' }]
});

exports.default = _mongoose2.default.model('Notebook', notebookSchema);