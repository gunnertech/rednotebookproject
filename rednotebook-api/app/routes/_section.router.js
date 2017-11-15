// ```
// _section.router.js
// (c) 2016 Gunner Technology
// cody@gunnertech.com.com
// ```

// */app/routes/_section.router.js*

// # Section API object

// HTTP Verb  Route                   Description

// GET        /api/section             Get all of the sections
// GET        /api/section/:section_id  Get a single section by section id
// POST       /api/section             Create a single section
// DELETE     /api/section/:section_id  Delete a single section
// PUT        /api/section/:section_id  Update a section with new info

import Section from '../models/section.model';

import _ from 'lodash';

export default (app, router, auth, admin, paid) => {

  router.route('/section')
    .post(auth, admin, (req, res) => {
      var safeProperties = req.body;
      Section.create(safeProperties)
      .then( (section) => {
        res.json(section);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    })

    .get(auth, paid, (req, res) => {
      Section.find().sort({position: 1})
      .then( (sections) => {
        res.json(sections);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    });

  router.route('/section/:section_id')
    .get(auth, paid, (req, res) => {
      Section.findOne({'_id': req.params.section_id}).populate(['master','children','inputs'])
      .then( (section) => {
        res.json(section);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    })
    
    .put(auth, admin, (req, res) => {
      Section.findOne({'_id': req.params.section_id})
      .then( (section) => {
        var safeProperties = req.body;
        _.assign(section, safeProperties);
        return section.save().then( () => section );
      })
      .then( (section) => {
        res.json(section);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    })

    .delete(auth, admin, (req, res) => {

      Section.findById(req.params.section_id)
      .then( (section) => {
        return section.remove();
      })
      .then( () => {
        res.status(200).send({});
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    });
};
