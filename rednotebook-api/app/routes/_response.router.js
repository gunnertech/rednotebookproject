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

import Response from '../models/response.model';

import _ from 'lodash';

export default (app, router, auth, admin, paid) => {

  router.route('/response')
    .post(auth, paid, (req, res) => {
      var safeProperties = req.body;
      var response = new Response();
      
      _.assign(response, safeProperties);
      response.encryptionKey = req.headers.encryptionkey;
      
      response.save()
      .then( (response) => {
        res.json(response);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    })

    .get(auth, paid, (req, res) => {
      Response.find().sort({position: 1})
      .then( (responses) => {
        res.json(responses);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    });

  router.route('/response/:response_id')
    .get(auth, paid, (req, res) => {
      Response.findOne({'_id': req.params.response_id}).populate(['master','children'])
      .then( (response) => {
        res.json(response);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    })
    
    .put(auth, paid, (req, res) => {
      Response.findOne({'_id': req.params.response_id})
      .then( (response) => {
        var safeProperties = req.body;
        _.assign(response, safeProperties);
        response.encryptionKey = req.headers.encryptionkey;
        return response.save().then( () => response );
      })
      .then( (response) => {
        res.json(response);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    })

    .delete(auth, paid, (req, res) => {

      Response.remove({
        _id : req.params.response_id
      })
      .then( () => {
        res.status(200).send({});
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    });
};
