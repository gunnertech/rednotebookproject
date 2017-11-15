'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _section = require('../models/section.model');

var _section2 = _interopRequireDefault(_section);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ```
// _section.router.js
// (c) 2016 Gunner Technology
// cody@gunnertech.com.com
// ```

// */app/routes/_section.router.js*

// # Section API object

// HTTP Verb  Route                   Description

// GET        /api/section             Get all of the sections
// GET        /api/section/:section_id  Get a single section by section id
// POST       /api/section             Create a single section
// DELETE     /api/section/:section_id  Delete a single section
// PUT        /api/section/:section_id  Update a section with new info

exports.default = function (app, router, auth, admin, paid) {

  router.route('/section').post(auth, admin, function (req, res) {
    var safeProperties = req.body;
    _section2.default.create(safeProperties).then(function (section) {
      res.json(section);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).get(auth, paid, function (req, res) {
    _section2.default.find().sort({ position: 1 }).then(function (sections) {
      res.json(sections);
    }).error(function (err) {
      res.status(500).send(err);
    });
  });

  router.route('/section/:section_id').get(auth, paid, function (req, res) {
    _section2.default.findOne({ '_id': req.params.section_id }).populate(['master', 'children', 'inputs']).then(function (section) {
      res.json(section);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).put(auth, admin, function (req, res) {
    _section2.default.findOne({ '_id': req.params.section_id }).then(function (section) {
      var safeProperties = req.body;
      _lodash2.default.assign(section, safeProperties);
      return section.save().then(function () {
        return section;
      });
    }).then(function (section) {
      res.json(section);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).delete(auth, admin, function (req, res) {

    _section2.default.findById(req.params.section_id).then(function (section) {
      return section.remove();
    }).then(function () {
      res.status(200).send({});
    }).error(function (err) {
      res.status(500).send(err);
    });
  });
};