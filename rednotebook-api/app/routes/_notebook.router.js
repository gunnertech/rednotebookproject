// ```
// _notebook.router.js
// (c) 2016 Gunner Technology
// cody@gunnertech.com.com
// ```

// */app/routes/_notebook.router.js*

// # Notebook API object

// HTTP Verb  Route                   Description

// GET        /api/notebook             Get all of the notebooks
// GET        /api/notebook/pdf         Get notebook in pdef format


import Notebook from '../models/notebook.model';
import User from '../models/user.model';

import PDFDocument from 'pdfkit';

import _ from 'lodash';

import Promise from 'bluebird';

export default (app, router, auth, admin, paid) => {

  router.route('/notebook')

    .get(auth, paid, (req, res) => {
      Notebook.find().populate({
        path: 'parts',
        options: { sort: { 'position': 1 } },
        populate: {
          path: 'documents'
        }
      })
      .then( (notebooks) => {
        res.json(notebooks);
      })
      .error( (err) => {
        res.status(500).send(err);
      });
    });

  router.route('/notebook/pdf')

    .get(auth, paid, (req, res) => {
      var encryptionKey = req.query.encryptionKey || 'invalid';

      Promise.resolve([
        Notebook.find().populate({
          path: 'parts',
          populate: {
            path: 'documents',
            populate: {
              path: 'sections',
              populate: [
                { path: 'children'},
                { path: 'inputs'}
              ]
            }
          }
        }),
        User.findById(req.user._id).populate(['assignments', 'responses'])
      ])
      .spread( (notebooks, user) => {

        var doc = new PDFDocument();
        doc.pipe(res);

        doc
          .fontSize(25)
          .text('Red Notebook');

        notebooks[0].parts.forEach((part) => {
          doc
            .addPage()
            .fontSize(25)
            .text(part.title);

          _.filter(part.documents, (document) => {
            return _.findIndex(user.assignments, (assignment) => {
              return assignment.document.toString() == document._id.toString();
            }) != -1
          }).forEach((document) => {
            doc
              .addPage()
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

          });
        })


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

      })
      .error( (err) => {
        res.status(500).send(err);
      });
    });

};
