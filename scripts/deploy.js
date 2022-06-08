//require("dotenv").config()
const { getFilePaths, uploadToS3 } = require('./uploader.js')
const AWS = require('aws-sdk');
const path = require('path');
var mime = require('mime-types')
var config = require("../config.json")
const credentials = new AWS.SharedIniFileCredentials({profile: 'interactives'});
const timer = ms => new Promise(res => setTimeout(res, ms)) 
const fs = require('fs').promises;

var cacheControl = "max-age=90"

AWS.config.credentials = credentials

/*
AWS.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey
});
*/

const s3 = new AWS.S3();

(async ()=>{

  let filepaths = await getFilePaths(`./dist/`)

  for await (const filepath of filepaths) {

    let extension = checkFile(filepath)

    let mimeType = mime.lookup(extension)

    let url = await uploadToS3(config.path, filepath, mimeType)

    const params = {
      Bucket: bucketName,
      ACL: "public-read", 
      Key: key,
      Body: fs.readFileSync(origin),
      CacheControl: cacheControl
    };
    // console.log(url)
  
  }

})()

function checkFile(file) {
  var extension = file.substr((file.lastIndexOf('.') +1));
  return extension //(!/(pdf|zip|doc|jpg|jpeg|png|js|css|html)$/ig.test(extension)) ? true : false
}
