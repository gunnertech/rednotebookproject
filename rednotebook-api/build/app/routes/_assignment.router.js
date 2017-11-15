'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assignment = require('../models/assignment.model');

var _assignment2 = _interopRequireDefault(_assignment);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ```
// _assignment.router.js
// (c) 2016 Gunner Technology
// cody@gunnertech.com.com
// ```

// */app/routes/_assignment.router.js*

// # Assignment API object

// HTTP Verb  Route                   Description

// GET        /api/assignment             Get all of the assignments
// GET        /api/assignment/:assignment_id  Get a single assignment by assignment id
// POST       /api/assignment             Create a single assignment
// DELETE     /api/assignment/:assignment_id  Delete a single assignment
// PUT        /api/assignment/:assignment_id  Update a assignment with new info

exports.default = function (app, router, auth, admin, paid) {

  router.route('/assignment').post(auth, paid, function (req, res) {
    var safeProperties = req.body;
    _assignment2.default.create(safeProperties).then(function (assignment) {
      res.json(assignment);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).get(auth, paid, function (req, res) {
    _assignment2.default.find().sort({ position: 1 }).then(function (assignments) {
      res.json(assignments);
    }).error(function (err) {
      res.status(500).send(err);
    });
  });

  router.route('/assignment/:assignment_id').get(auth, paid, function (req, res) {
    _assignment2.default.findOne({ '_id': req.params.assignment_id }).populate(['master', 'children']).then(function (assignment) {
      res.json(assignment);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).put(auth, paid, function (req, res) {
    _assignment2.default.findOne({ '_id': req.params.assignment_id }).then(function (assignment) {
      var safeProperties = req.body;
      _lodash2.default.assign(assignment, safeProperties);
      return assignment.save().then(function () {
        return assignment;
      });
    }).then(function (assignment) {
      res.json(assignment);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).delete(auth, paid, function (req, res) {

    _assignment2.default.remove({
      _id: req.params.assignment_id
    }).then(function () {
      res.status(200).send({});
    }).error(function (err) {
      res.status(500).send(err);
    });
  });
};