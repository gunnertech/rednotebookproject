'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _notebook = require('../models/notebook.model');

var _notebook2 = _interopRequireDefault(_notebook);

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

var _pdfkit = require('pdfkit');

var _pdfkit2 = _interopRequireDefault(_pdfkit);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app, router, auth, admin, paid) {

  router.route('/notebook').get(auth, paid, function (req, res) {
    _notebook2.default.find().populate({
      path: 'parts',
      options: { sort: { 'position': 1 } },
      populate: {
        path: 'documents'
      }
    }).then(function (notebooks) {
      res.json(notebooks);
    }).error(function (err) {
      res.status(500).send(err);
    });
  });

  router.route('/notebook/pdf').get(auth, paid, function (req, res) {
    var encryptionKey = req.query.encryptionKey || 'invalid';

    _bluebird2.default.resolve([_notebook2.default.find().populate({
      path: 'parts',
      populate: {
        path: 'documents',
        populate: {
          path: 'sections',
          populate: [{ path: 'children' }, { path: 'inputs' }]
        }
      }
    }), _user2.default.findById(req.user._id).populate(['assignments', 'responses'])]).spread(function (notebooks, user) {

      var doc = new _pdfkit2.default();
      doc.pipe(res);

      doc.fontSize(25).text('Red Notebook');

      notebooks[0].parts.forEach(function (part) {
        doc.addPage().fontSize(25).text(part.title);

        _lodash2.default.filter(part.documents, function (document) {
          return _lodash2.default.findIndex(user.assignments, function (assignment) {
            return assignment.document.toString() == document._id.toString();
          }) != -1;
        }).forEach(function (document) {
          doc.addPage().fontSize(16).text(document.title).text(" ").fontSize(12);

          document.sections.forEach(function (section) {
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
        });
      });

      res.statusCode = 200;
      res.setHeader('Content-type', 'application/pdf');
      res.setHeader('Access-Control-Allow-Origin', '*');
      // res.setHeader('Content-disposition', 'attachment; filename=YourRedNoteBook.pdf');


      // doc.save().moveTo(100, 150).lineTo(100, 250).lineTo(200, 250).fill('#FF3300');
      // doc.scale(0.6).translate(470, -380).path('M 250,75 L 323,301 131,161 369,161 177,301 z').fill('red', 'even-odd').restore();

      // doc.addPage().fillColor('blue').text('Here is a link!', 100, 100).underline(100, 100, 160, 27, {
      //   color: '#0000FF'
      // }).link(100, 100, 160, 27, 'http://google.com/');

      doc.end();
    }).error(function (err) {
      res.status(500).send(err);
    });
  });
}; // ```
// _notebook.router.js
// (c) 2016 Gunner Technology
// cody@gunnertech.com.com
// ```

// */app/routes/_notebook.router.js*

// # Notebook API object

// HTTP Verb  Route                   Description

// GET        /api/notebook             Get all of the notebooks
// GET        /api/notebook/pdf         Get notebook in pdef format