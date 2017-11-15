'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _response = require('../models/response.model');

var _response2 = _interopRequireDefault(_response);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ```
// _response.router.js
// (c) 2016 Gunner Technology
// cody@gunnertech.com.com
// ```

// */app/routes/_response.router.js*

// # Response API object

// HTTP Verb  Route                   Description

// GET        /api/response             Get all of the responses
// GET        /api/response/:response_id  Get a single response by response id
// POST       /api/response             Create a single response
// DELETE     /api/response/:response_id  Delete a single response
// PUT        /api/response/:response_id  Update a response with new info

exports.default = function (app, router, auth, admin, paid) {

  router.route('/response').post(auth, paid, function (req, res) {
    var safeProperties = req.body;
    var response = new _response2.default();

    _lodash2.default.assign(response, safeProperties);
    response.encryptionKey = req.headers.encryptionkey;

    response.save().then(function (response) {
      res.json(response);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).get(auth, paid, function (req, res) {
    _response2.default.find().sort({ position: 1 }).then(function (responses) {
      res.json(responses);
    }).error(function (err) {
      res.status(500).send(err);
    });
  });

  router.route('/response/:response_id').get(auth, paid, function (req, res) {
    _response2.default.findOne({ '_id': req.params.response_id }).populate(['master', 'children']).then(function (response) {
      res.json(response);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).put(auth, paid, function (req, res) {
    _response2.default.findOne({ '_id': req.params.response_id }).then(function (response) {
      var safeProperties = req.body;
      _lodash2.default.assign(response, safeProperties);
      response.encryptionKey = req.headers.encryptionkey;
      return response.save().then(function () {
        return response;
      });
    }).then(function (response) {
      res.json(response);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).delete(auth, paid, function (req, res) {

    _response2.default.remove({
      _id: req.params.response_id
    }).then(function () {
      res.status(200).send({});
    }).error(function (err) {
      res.status(500).send(err);
    });
  });
};