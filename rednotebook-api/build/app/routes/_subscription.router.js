'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app, router, auth, admin, paid) {
    router.route('/subscription').post(auth, function (req, res) {

        _user2.default.findById(req.user._id).then(function (user) {
            user.billingInfo = req.body.billingInfo;
            return user.save().then(function () {
                return user;
            });
        }).then(function (user) {
            return [user.subscribe(), user];
        }).spread(function (subscription, user) {
            user.recurlyAccountStatus = 'live';
            return user.save().then(function () {
                return subscription;
            });
        }).then(function (subscription) {
            console.log(subscription);
            res.json(subscription);
        }).error(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
    });
}; // ```
// _subscription.router.js
// (c) 2016 Gunner Technology
// cody@gunnertech.com.com
// ```

// */app/routes/_subscription.router.js*

// # Part API object

// HTTP Verb  Route                   Description

// POST       /api/subscription             Create a single subscription