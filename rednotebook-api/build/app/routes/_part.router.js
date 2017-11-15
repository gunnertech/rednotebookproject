'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _part = require('../models/part.model');

var _part2 = _interopRequireDefault(_part);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app, router, auth, admin, paid) {

  router.route('/part').post(auth, admin, function (req, res) {
    _part2.default.create({
      notebook: req.body.notebook,
      title: req.body.title,
      position: req.body.position
    }).then(function (part) {
      res.json(part);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).get(auth, paid, function (req, res) {
    _part2.default.find().sort({ position: 1 }).then(function (parts) {
      res.json(parts);
    }).error(function (err) {
      res.status(500).send(err);
    });
  });

  router.route('/part/:part_id').get(auth, paid, function (req, res) {
    _part2.default.findOne({ '_id': req.params.part_id }).populate('documents').then(function (part) {
      res.json(part);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).put(auth, admin, function (req, res) {
    _part2.default.findOne({ '_id': req.params.part_id }).then(function (part) {
      part.title = req.body.title || part.title;
      part.position = req.body.position || part.position;

      return part.save().then(function () {
        return part;
      });
    }).then(function (part) {
      res.json(part);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).delete(auth, admin, function (req, res) {

    _part2.default.remove({
      _id: req.params.part_id
    }).then(function () {
      res.status(200).send({});
    }).error(function (err) {
      res.status(500).send(err);
    });
  });
}; // ```
// _part.router.js
// (c) 2016 Gunner Technology
// cody@gunnertech.com.com
// ```

// */app/routes/_part.router.js*

// # Part API object

// HTTP Verb  Route                   Description

// GET        /api/part             Get all of the parts
// GET        /api/part/:part_id  Get a single part by part id
// POST       /api/part             Create a single part
// DELETE     /api/part/:part_id  Delete a single part
// PUT        /api/part/:part_id  Update a part with new info