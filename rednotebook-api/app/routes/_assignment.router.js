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

import Assignment from '../models/assignment.model';

import _ from 'lodash';

export default (app, router, auth, admin, paid) => {

  router.route('/assignment')
    .post(auth, paid, (req, res) => {
      var safeProperties = req.body;
      Assignment.create(safeProperties)
      .then( (assignment) => {
        res.json(assignment);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    })

    .get(auth, paid, (req, res) => {
      Assignment.find().sort({position: 1})
      .then( (assignments) => {
        res.json(assignments);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    });

  router.route('/assignment/:assignment_id')
    .get(auth, paid, (req, res) => {
      Assignment.findOne({'_id': req.params.assignment_id}).populate(['master','children'])
      .then( (assignment) => {
        res.json(assignment);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    })
    
    .put(auth, paid, (req, res) => {
      Assignment.findOne({'_id': req.params.assignment_id})
      .then( (assignment) => {
        var safeProperties = req.body;
        _.assign(assignment, safeProperties);
        return assignment.save().then( () => assignment );
      })
      .then( (assignment) => {
        res.json(assignment);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    })

    .delete(auth, paid, (req, res) => {

      Assignment.remove({
        _id : req.params.assignment_id
      })
      .then( () => {
        res.status(200).send({});
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    });
};
