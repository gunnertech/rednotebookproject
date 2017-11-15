"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

// ```
// mongoose.conf.js
// (c) 2016 David Newman
// david.r.niciforovic@gmail.com
// mongoose.conf.js may be freely distributed under the MIT license
// ```

// *mongoose.conf.js*

exports.default = function (mongoose) {

  var gracefulExit = function gracefulExit() {

    mongoose.connection.close(function () {

      console.log("Mongoose connection " + "has disconnected through app termination");

      process.exit(0);
    });
  };

  mongoose.connection.on("connected", function (ref) {

    console.log("Successfully connected to " + process.env.NODE_ENV + " database on startup ");
  });

  // If the connection throws an error
  mongoose.connection.on("error", function (err) {

    console.error("Failed to connect to " + process.env.NODE_ENV + " " + " database on startup ", err);
  });

  // When the connection is disconnected
  mongoose.connection.on('disconnected', function () {

    console.log("Mongoose default connection to " + process.env.NODE_ENV + " database disconnected");
  });

  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

  // Connect to our MongoDB database using the MongoDB
  // connection URI from our predefined environment variable
  console.log(process.env.MONGO_URI);
  mongoose.connect(process.env.MONGO_URI, function (error) {

    if (error) throw error;
  });
};