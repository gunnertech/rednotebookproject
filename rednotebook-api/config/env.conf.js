// ```
// env.conf.js
// (c) 2016 David Newman
// david.r.niciforovic@gmail.com
// env.conf.js may be freely distributed under the MIT license
// ```

// *env.conf.js*

// This is the file where we will configure our Node environmental
// variables for production

// Reference : http://thewebivore.com/super-simple-environment-variables-node-js/#comment-286662

// # Node Env Variables

import env from 'node-env-file';

try{ env(__dirname + '/../.env'); } catch(err) {}

export function validateEnvVariables() {
  // If no value has been assigned to our environment variables,
  // set them up...
  if(!process.env.NODE_ENV)
    console.log("No NODE_ENV");

  // For Express/Passport
  if (!process.env.SESSION_SECRET)
    console.log("No SESSION_SECRET");

  if (!process.env.PORT)
    console.log("No PORT");

  // Set the appropriate MongoDB URI
  validateMongoUri();

  return;
}

// Set the appropriate MongoDB URI with the `config` object
// based on the value in `process.env.NODE_ENV
function validateMongoUri() {
  if (!process.env.MONGO_URI) {
    console.log('No value set for MONGO_URI...');
    console.log('Using the supplied value from config object...')
  }

  return;
}
