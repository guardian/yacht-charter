require("dotenv").config()

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

var config = require("../config.json")

var cacheControl = "max-age=90"

AWS.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey
});

const s3 = new AWS.S3();

const directoryName = './dist/'
const bucketName = "gdn-cdn";

const filePaths = [];
const getFilePaths = async (dir) => {

  fs.readdirSync(dir).forEach(function (name) {
    const filePath = path.join(dir, name);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      filePaths.push(filePath);
    } else if (stat.isDirectory()) {
      getFilePaths(filePath);
    }
  });

};

const uploadToS3 = (dir, origin) => {
  return new Promise((resolve, reject) => {

    let key = `${dir}/${origin.split(`dist/`)[1]}`

    const params = {
      Bucket: bucketName,
      ACL: "public-read", 
      Key: key,
      Body: fs.readFileSync(origin),
      CacheControl: cacheControl,
    };

    s3.putObject(params, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`uploaded ${params.Key} to ${params.Bucket}`);
        resolve(origin);
      }
    });

  });
};

getFilePaths(directoryName).then( () => {

  const uploadPromises = filePaths.map((path) =>
    uploadToS3(config.path, path)
  );

  Promise.all(uploadPromises)
    .then((result) => {
      console.log('Knight riders');
      console.log(result);
    })
    .catch((err) => console.error(err));

})
