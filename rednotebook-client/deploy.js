'use strict';

require('dotenv').config();

var env = Object.create(process.env);
env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
env.AWS_DEFAULT_REGION = process.env.AWS_DEFAULT_REGION;

const spawn = require('child_process').spawnSync;
const cmd = spawn('aws', ['s3', 'sync', 'www/',
    's3://' + process.env.S3_BUCKET_NAME + '/', '--delete'
], { env: env });

console.log(cmd)

console.log(`stderr: ${cmd.stderr.toString()}`);
console.log(`stdout: ${cmd.stdout.toString()}`);