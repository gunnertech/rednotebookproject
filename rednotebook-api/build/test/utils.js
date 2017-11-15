// test/utils.js

'use strict';

var _config = require('../config/config.json');

var _config2 = _interopRequireDefault(_config);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ENV = 'test';

// ensure the NODE_ENV is set to 'test'
// this is helpful when you would like to change behavior when testing
process.env.NODE_ENV = ENV;

var mongoUri = _config2.default.MONGO_URI[ENV.toUpperCase()];

beforeEach(function (done) {

  function clearDB() {

    for (var i in _mongoose2.default.connection.collections) {

      _mongoose2.default.connection.collections[i].remove(function (error, status) {

        if (error) console.error(error);
      });
    }

    return done();
  }

  if (_mongoose2.default.connection.readyState === 0) {

    _mongoose2.default.connect(mongoUri, function (err) {

      if (err) {

        throw err;
      }

      return clearDB();
    });
  } else {

    return clearDB();
  }
});

afterEach(function (done) {

  _mongoose2.default.disconnect();
  return done();
});