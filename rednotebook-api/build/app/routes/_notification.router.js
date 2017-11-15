'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _notification = require('../models/notification.model');

var _notification2 = _interopRequireDefault(_notification);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ```
// _notification.router.js
// (c) 2016 Gunner Technology
// cody@gunnertech.com.com
// ```

// */app/routes/_notification.router.js*

// # Notification API object

// HTTP Verb  Route                   Description

// GET        /api/notification             Get all of the notifications
// GET        /api/notification/:notification_id  Get a single notification by notification id
// POST       /api/notification             Create a single notification
// DELETE     /api/notification/:notification_id  Delete a single notification
// PUT        /api/notification/:notification_id  Update a notification with new info

exports.default = function (app, router, auth, admin, paid) {

  router.route('/notification').post(auth, paid, function (req, res) {
    var safeProperties = req.body;
    _notification2.default.create(safeProperties).then(function (notification) {
      res.json(notification);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).get(auth, paid, function (req, res) {
    _notification2.default.find().sort({ position: 1 }).then(function (notifications) {
      res.json(notifications);
    }).error(function (err) {
      res.status(500).send(err);
    });
  });

  router.route('/notification/:notification_id').get(auth, paid, function (req, res) {
    _notification2.default.findOne({ '_id': req.params.notification_id }).populate(['master', 'children']).then(function (notification) {
      res.json(notification);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).put(auth, paid, function (req, res) {
    _notification2.default.findOne({ '_id': req.params.notification_id }).then(function (notification) {
      var safeProperties = req.body;
      _lodash2.default.assign(notification, safeProperties);
      return notification.save().then(function () {
        return notification;
      });
    }).then(function (notification) {
      res.json(notification);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).delete(auth, paid, function (req, res) {

    _notification2.default.remove({
      _id: req.params.notification_id
    }).then(function () {
      res.status(200).send({});
    }).error(function (err) {
      res.status(500).send(err);
    });
  });
};