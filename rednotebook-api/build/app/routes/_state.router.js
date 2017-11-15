'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _state = require('../models/state.model');

var _state2 = _interopRequireDefault(_state);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ```
// _state.router.js
// (c) 2016 Gunner Technology
// cody@gunnertech.com.com
// ```

// */app/routes/_state.router.js*

// # State API object

// HTTP Verb  Route                   Description

// GET        /api/state             Get all of the states


exports.default = function (app, router, auth, admin, paid) {

  router.route('/state').get(function (req, res) {
    _state2.default.find().sort({ name: 1 }).then(function (states) {
      res.json(states);
    }).error(function (err) {
      res.status(500).send(err);
    });
  });
};