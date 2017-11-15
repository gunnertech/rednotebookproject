// ```
// gulpfile.conf.js
// (c) 2016 David Newman
// david.r.niciforovic@gmail.com
// gulpfile.conf.js may be freely distributed under the MIT license
// ```

// *gulpfile.js*

// Import gulp packages
import gulp from 'gulp';
import gutil from 'gulp-util';
import nodemon from 'gulp-nodemon';


// Sugar for `gulp serve:watch`
gulp.task('serve', ['serve:watch']);

// Configure gulp-nodemon
// This watches the files belonging to the app for changes
// and restarts the server whenever a change is detected
gulp.task('serve:watch', () => {

  nodemon({
    script : 'server.js',
    ext : 'js'
  });
});