const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const credentials = new AWS.SharedIniFileCredentials({profile: 'interactives'});
const timer = ms => new Promise(res => setTimeout(res, ms))

AWS.config.credentials = credentials

const s3 = new AWS.S3();

const bucketName = "gdn-cdn";

const filePaths = [];

let blacklist = [".DS_Store"]


function contains(a, b) {
    // array matches
    if (Array.isArray(b)) {
        return b.some(x => a.indexOf(x) > -1);
    }
    // string match
    return a.indexOf(b) > -1;
}


async function getFilePaths(dir) {

  await fs.readdirSync(dir).forEach(function (name) {
    const filePath = path.join(dir, name);
    
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      if (!contains(blacklist, name)) {
        filePaths.push(filePath);
      }
    } else if (stat.isDirectory()) {
      getFilePaths(filePath);
    }
  })

  return filePaths

};

async function uploadToS3(dir, origin, mimeType) { //  format, ext
  return new Promise((resolve, reject) => {

  	let key = `${dir}${origin.split(`dist/`)[1]}`

    const params = {
		Bucket: bucketName,
		Key: key,
		Body: fs.readFileSync(origin),
		ContentType: `${mimeType}`,
		ACL:'public-read',
    CacheControl: "max-age=30"

    };

    s3.putObject(params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(`https://interactive.guim.co.uk/${key}`);
      }
    });

  });
};

module.exports = { uploadToS3, getFilePaths };