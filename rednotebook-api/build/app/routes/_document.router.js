'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _document = require('../models/document.model');

var _document2 = _interopRequireDefault(_document);

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

var _pdfkit = require('pdfkit');

var _pdfkit2 = _interopRequireDefault(_pdfkit);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app, router, auth, admin, paid) {

  router.route('/document').post(auth, admin, function (req, res) {
    var safeProperties = req.body;
    _document2.default.create(safeProperties).then(function (document) {
      res.json(document);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).get(auth, paid, function (req, res) {
    _document2.default.find().sort({ position: 1 }).populate('sections').then(function (documents) {
      res.json(documents);
    }).error(function (err) {
      res.status(500).send(err);
    });
  });

  router.route('/document/:document_id\.pdf').get(auth, paid, function (req, res) {
    var encryptionKey = req.query.encryptionKey || 'invalid';

    _bluebird2.default.resolve([_document2.default.findById(req.params.document_id).populate({
      path: 'sections',
      populate: [{ path: 'children' }, { path: 'inputs' }]
    }), _user2.default.findById(req.user._id).populate(['assignments', 'responses'])]).spread(function (document, user) {

      var doc = new _pdfkit2.default();
      doc.pipe(res);

      doc.fontSize(16).text(document.title).text(" ").fontSize(12);

      document.sections.forEach(function (section) {
        if (section.title) doc.fontSize(14).text(section.title);
        if (section.description) doc.fontSize(12).text(section.description);

        doc.fontSize(12).text(" ");

        section.inputs.forEach(function (input) {
          doc.text(input.label);
          var response = _lodash2.default.find(user.responses, function (r) {
            return r.input.toString() == input._id.toString();
          });

          if (response) {
            response.encryptionKey = encryptionKey;
            if (["Short Text", "Number", "Percentage", "Long Text", "Date"].indexOf(input.dataType) != -1) {
              if (input.choices) {
                var responses = response.value.split(",");
                input.choices.split("\n").forEach(function (choice) {
                  if (responses.indexOf(choice) == -1) {
                    doc.text(choice);
                  } else {
                    doc.text(choice + " [X]");
                  }
                });
              } else {
                doc.text(response.decryptedValue, { underline: true });
              }
            } else if (input.dataType == 'File') {
              doc.text('[Please print your uploaded file and attach it to this document]');
            }
          } else {
            if (input.dataType == 'File') {
              doc.text('[No File Uploaded]');
            }
          }

          doc.text(" ");
        });

        doc.fontSize(12).text(" ");

        if (section.repeatable) {
          section.children.forEach(function (section) {

            var hasBeenFilledOut = -1 != _lodash2.default.findIndex(user.responses, function (r) {
              return -1 != _lodash2.default.findIndex(section.inputs, function (input) {
                return r.input.toString() == input._id.toString();
              });
            });

            if (hasBeenFilledOut) {
              if (section.title) doc.fontSize(14).text(section.title);
              if (section.description) doc.fontSize(12).text(section.description);

              doc.fontSize(12).text(" ");

              section.inputs.forEach(function (input) {
                doc.text(input.label);
                var response = _lodash2.default.find(user.responses, function (r) {
                  return r.input.toString() == input._id.toString();
                });

                //enum: ["File", "Short Text", "Number", "Percentage", "Long Text", "Date"]
                if (response) {
                  response.encryptionKey = encryptionKey;
                  if (["Short Text", "Number", "Percentage", "Long Text", "Date"].indexOf(input.dataType) != -1) {
                    if (input.choices) {
                      var responses = response.value.split(",");
                      input.choices.split("\n").forEach(function (choice) {
                        if (responses.indexOf(choice) == -1) {
                          doc.text(choice);
                        } else {
                          doc.text(choice + " [X]");
                        }
                      });
                    } else {
                      doc.text(response.decryptedValue, { underline: true });
                    }
                  } else if (input.dataType == 'File') {
                    doc.text('[Please print your uploaded file and attach it to this document]');
                  }
                } else {
                  if (input.dataType == 'File') {
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
    }).error(function (err) {
      res.status(500).send(err);
    });
  });

  router.route('/document/:document_id').get(auth, paid, function (req, res) {
    _document2.default.findById(req.params.document_id).populate(['part', 'state', 'assignments']).populate({
      path: 'sections',
      populate: {
        path: 'inputs'
      }
    }).populate({
      path: 'sections',
      populate: {
        path: 'children',
        populate: {
          path: 'inputs'
        }
      }
    }).then(function (document) {
      res.json(document);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).put(auth, admin, function (req, res) {
    _document2.default.findOne({ '_id': req.params.document_id }).then(function (document) {
      var safeProperties = req.body;
      _lodash2.default.assign(document, safeProperties);
      return document.save().then(function () {
        return document;
      });
    }).then(function (document) {
      res.json(document);
    }).error(function (err) {
      res.status(500).send(err);
    });
  }).delete(auth, admin, function (req, res) {

    _document2.default.remove({
      _id: req.params.document_id
    }).then(function () {
      res.status(200).send({});
    }).error(function (err) {
      res.status(500).send(err);
    });
  });
}; // ```
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