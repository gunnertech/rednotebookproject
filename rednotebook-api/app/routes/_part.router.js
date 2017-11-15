// ```
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

import Part from '../models/part.model';

export default (app, router, auth, admin, paid) => {

  router.route('/part')
    .post(auth, admin, (req, res) => {
      Part.create({
        notebook: req.body.notebook,
        title: req.body.title,
        position: req.body.position
      })
      .then( (part) => {
        res.json(part);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    })

    .get(auth, paid, (req, res) => {
      Part.find().sort({position: 1})
      .then( (parts) => {
        res.json(parts);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    });

  router.route('/part/:part_id')
    .get(auth, paid, (req, res) => {
      Part.findOne({'_id': req.params.part_id}).populate('documents')
      .then( (part) => {
        res.json(part);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    })
    
    .put(auth, admin, (req, res) => {
      Part.findOne({'_id': req.params.part_id})
      .then( (part) => {
        part.title = req.body.title || part.title;
        part.position  = req.body.position || part.position;

        return part.save().then( () => part );
      })
      .then( (part) => {
        res.json(part);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    })

    .delete(auth, admin, (req, res) => {

      Part.remove({
        _id : req.params.part_id
      })
      .then( () => {
        res.status(200).send({});
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    });
};
