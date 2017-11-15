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

import Notification from '../models/notification.model';

import _ from 'lodash';

export default (app, router, auth, admin, paid) => {

  router.route('/notification')
    .post(auth, paid, (req, res) => {
      var safeProperties = req.body;
      Notification.create(safeProperties)
      .then( (notification) => {
        res.json(notification);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    })

    .get(auth, paid, (req, res) => {
      Notification.find().sort({position: 1})
      .then( (notifications) => {
        res.json(notifications);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    });

  router.route('/notification/:notification_id')
    .get(auth, paid, (req, res) => {
      Notification.findOne({'_id': req.params.notification_id}).populate(['master','children'])
      .then( (notification) => {
        res.json(notification);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    })
    
    .put(auth, paid, (req, res) => {
      Notification.findOne({'_id': req.params.notification_id})
      .then( (notification) => {
        var safeProperties = req.body;
        _.assign(notification, safeProperties);
        return notification.save().then( () => notification );
      })
      .then( (notification) => {
        res.json(notification);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    })

    .delete(auth, paid, (req, res) => {

      Notification.remove({
        _id : req.params.notification_id
      })
      .then( () => {
        res.status(200).send({});
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    });
};
