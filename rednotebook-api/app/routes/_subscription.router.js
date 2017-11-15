// ```
// _subscription.router.js
// (c) 2016 Gunner Technology
// cody@gunnertech.com.com
// ```

// */app/routes/_subscription.router.js*

// # Part API object

// HTTP Verb  Route                   Description

// POST       /api/subscription             Create a single subscription


import User from '../models/user.model';

export default (app, router, auth, admin, paid) => {
    router.route('/subscription')
        .post(auth, (req, res) => {

            User.findById(req.user._id)
                .then(function(user) {
                    user.billingInfo = req.body.billingInfo;
                    return user.save().then(function() { return user; });
                })
                .then(function(user) {
                    return [user.subscribe(), user];
                })
                .spread((subscription, user) => {
                    user.recurlyAccountStatus = 'live';
                    return user.save().then(() => subscription);
                })
                .then((subscription) => {
                    console.log(subscription);
                    res.json(subscription);
                })
                .error((err) => {
                    console.log(err);
                    res.status(500).send(err);
                });
        });
};