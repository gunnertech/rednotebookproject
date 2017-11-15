// ```
// _state.router.js
// (c) 2016 Gunner Technology
// cody@gunnertech.com.com
// ```

// */app/routes/_state.router.js*

// # State API object

// HTTP Verb  Route                   Description

// GET        /api/state             Get all of the states


import State from '../models/state.model';

import _ from 'lodash';

export default (app, router, auth, admin, paid) => {

  router.route('/state')
    .get((req, res) => {
      State.find().sort({name: 1})
      .then( (states) => {
        res.json(states);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    });

};
