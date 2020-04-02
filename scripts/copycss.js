const { compileSassAndSaveMultiple } = require('compile-sass')
const fs = require("fs")
const path = require('path');

const sassFolder = path.join( __dirname, '..', 'src/styles')
const cssFolder = path.join( __dirname, '..', 'dist')
var sassFiles = fs
console.log()

var sass = []

fs.readdir(sassFolder, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        if (!file.includes('_') & file.includes('.scss')) {
        	sass.push(file)
        }

    });

    console.log(sass)

    compile(sass)
});

async function compile (files) {
	await compileSassAndSaveMultiple({
	    sassPath: sassFolder,
	    cssPath: cssFolder,
    	files: files
 	 });
}