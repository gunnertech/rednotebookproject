// ```
// _document.router.js
// (c) 2016 Gunner Technology
// cody@gunnertech.com.com
// ```

// */app/routes/_document.router.js*

// # Document API object

// HTTP Verb  Route                   Description

// GET        /api/document             Get all of the documents
// GET        /api/document/:document_id  Get a single document by document id
// POST       /api/document             Create a single document
// DELETE     /api/document/:document_id  Delete a single document
// PUT        /api/document/:document_id  Update a document with new info

import Document from '../models/document.model';
import User from '../models/user.model';

import PDFDocument from 'pdfkit';
import Promise from 'bluebird';

import _ from 'lodash';

export default (app, router, auth, admin, paid) => {

  router.route('/document')
    .post(auth, admin, (req, res) => {
      var safeProperties = req.body;
      Document.create(safeProperties)
      .then( (document) => {
        res.json(document);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    })

    .get(auth, paid, (req, res) => {
      Document.find().sort({position: 1}).populate('sections')
      .then( (documents) => {
        res.json(documents);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    });

  router.route('/document/:document_id\.pdf')

    .get(auth, paid, (req, res) => {
      var encryptionKey = req.query.encryptionKey || 'invalid';

      Promise.resolve([
        Document.findById(req.params.document_id).populate({
          path: 'sections',
          populate: [
            { path: 'children'},
            { path: 'inputs'}
          ]
        }),
        User.findById(req.user._id).populate(['assignments', 'responses'])
      ])
      .spread( (document, user) => {

        var doc = new PDFDocument();
        doc.pipe(res);

        doc
          .fontSize(16)
          .text(document.title)
          .text(" ")
          .fontSize(12);

        document.sections.forEach((section) => {
          if(section.title) doc.fontSize(14).text(section.title)
          if(section.description) doc.fontSize(12).text(section.description);

          doc.fontSize(12).text(" ");

          section.inputs.forEach((input) => {
            doc.text(input.label);
            var response = _.find(user.responses, (r) => { return r.input.toString() == input._id.toString(); });

            if(response) {
              response.encryptionKey = encryptionKey;
              if(["Short Text", "Number", "Percentage", "Long Text", "Date"].indexOf(input.dataType) != -1) {
                if(input.choices) {
                  var responses = response.value.split(",");
                  input.choices.split("\n").forEach((choice) => {
                    if(responses.indexOf(choice) ==-1) {
                      doc.text(choice);    
                    } else {
                      doc.text((choice + " [X]"));    
                    }
                  });
                } else {
                  doc.text(response.decryptedValue,{underline: true});
                }
              } else if(input.dataType == 'File') {
                doc.text('[Please print your uploaded file and attach it to this document]');
              }
            } else {
              if(input.dataType == 'File') {
                doc.text('[No File Uploaded]');
              }
            }

            doc.text(" ");

          });

          doc.fontSize(12).text(" ");

          if(section.repeatable) {
            section.children.forEach((section) => {

              var hasBeenFilledOut = (-1 != _.findIndex(user.responses, (r) => { 
                return -1 != _.findIndex(section.inputs, (input) => { return r.input.toString() == input._id.toString(); });
              }));

              if (hasBeenFilledOut) {
                if(section.title) doc.fontSize(14).text(section.title)
                if(section.description) doc.fontSize(12).text(section.description);

                doc.fontSize(12).text(" ");

                section.inputs.forEach((input) => {
                  doc.text(input.label);
                  var response = _.find(user.responses, (r) => { return r.input.toString() == input._id.toString(); });

                  //enum: ["File", "Short Text", "Number", "Percentage", "Long Text", "Date"]
                  if(response) {
                    response.encryptionKey = encryptionKey;
                    if(["Short Text", "Number", "Percentage", "Long Text", "Date"].indexOf(input.dataType) != -1) {
                      if(input.choices) {
                        var responses = response.value.split(",");
                        input.choices.split("\n").forEach((choice) => {
                          if(responses.indexOf(choice) ==-1) {
                            doc.text(choice);    
                          } else {
                            doc.text((choice + " [X]"));    
                          }
                        });
                      } else {
                        doc.text(response.decryptedValue,{underline: true});
                      }
                    } else if(input.dataType == 'File') {
                      doc.text('[Please print your uploaded file and attach it to this document]');
                    }
                  } else {
                    if(input.dataType == 'File') {
                      doc.text('[No File Uploaded]');
                    }
                  }

                  doc.text(" ");

                });

                doc.fontSize(12).text(" ");
              }
            });
          }
        });


        res.statusCode = 200;
        res.setHeader('Content-type', 'application/pdf');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        doc.end();

      })
      .error( (err) => {
        res.status(500).send(err);
      });
    });

  router.route('/document/:document_id')
    .get(auth, paid, (req, res) => {
      Document.findById(req.params.document_id).populate(['part','state','assignments'])
      .populate({
        path: 'sections',
        populate: {
          path: 'inputs'
        }
      })
      .populate({
        path: 'sections',
        populate: {
          path: 'children',
          populate: {
            path: 'inputs'
          }
        }
      })
      .then( (document) => {
        res.json(document);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    })
    
    .put(auth, admin, (req, res) => {
      Document.findOne({'_id': req.params.document_id})
      .then( (document) => {
        var safeProperties = req.body;
        _.assign(document, safeProperties);
        return document.save().then( () => document );
      })
      .then( (document) => {
        res.json(document);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    })

    .delete(auth, admin, (req, res) => {

      Document.remove({
        _id : req.params.document_id
      })
      .then( () => {
        res.status(200).send({});
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    });
};
