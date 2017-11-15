'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _input = require('../models/input.model');

var _input2 = _interopRequireDefault(_input);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ```
// _input.router.js
// (c) 2016 Gunner Technology
// cody@gunnertech.com.com
// ```

// */app/routes/_input.router.js*

// # Input API object

// HTTP Verb  Route                   Description

// GET        /api/input             Get all of the inputs
// GET        /api/input/:input_id  Get a single input by input id
// POST       /api/input             Create a single input
// DELETE     /api/input/:input_id  Delete a single input
// PUT        /api/input/:input_id  Update a input with new info

exports.default = function (app, router, auth, admin, paid) {

  router.route('/input').post(auth, admin, function (req, res) {
    var safeProperties = req.body;
    _input2.default.create(safeProperties).then(function (input) {
      res.json(input);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).get(auth, paid, function (req, res) {
    _input2.default.find().sort({ position: 1 }).then(function (inputs) {
      res.json(inputs);
    }).error(function (err) {
      res.status(500).send(err);
    });
  });

  router.route('/input/:input_id').get(auth, paid, function (req, res) {
    _input2.default.findOne({ '_id': req.params.input_id }).populate(['master', 'children', 'responses']).then(function (input) {
      res.json(input);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).put(auth, admin, function (req, res) {
    _input2.default.findOne({ '_id': req.params.input_id }).then(function (input) {
      var safeProperties = req.body;
      _lodash2.default.assign(input, safeProperties);
      return input.save().then(function () {
        return input;
      });
    }).then(function (input) {
      res.json(input);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).delete(auth, admin, function (req, res) {

    _input2.default.findById(req.params.input_id).then(function (input) {
      return input.remove();
    }).then(function () {
      res.status(200).send({});
    }).error(function (err) {
      res.status(500).send(err);
    });
  });
};