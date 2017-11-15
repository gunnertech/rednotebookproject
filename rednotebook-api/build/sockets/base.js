'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

// ```
// base.js
// (c) 2015 David Newman
// david.r.niciforovic@gmail.com
// base.js may be freely distributed under the MIT license
// ```

// *base.js*

// This file contains the most basic functionality for server Socket.io
// functionality.

exports.default = function (io) {

  io.sockets.on('connect', function (socket) {

    console.log('a user connected');

    socket.on('disconnect', function () {

      console.log('a user disconnected');
    });
  });
};