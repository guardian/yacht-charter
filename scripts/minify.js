const uglifyjs  = require('uglify-js') //uglify-js@2
const fs = require("fs")
const path = require('path');


var app = {

    precheck: (destination) => {

        console.log(destination)

        if (destination!="") {

            app.reader(destination)

        }

    },

    reader: (destination) => {

        const charts = path.join( __dirname, '..', destination)

        fs.readdir(charts, function (err, files) {

            if (err) {

                return console.log('Unable to read directory: ' + err);

            } 

            files.forEach(function (file) {

                var result = uglifyjs.minify(`${charts}/${file}`)

                app.writer(result.code, charts, file)

            });

        });

    },

    writer: (minified, url, file) => {

        fs.writeFile(`${url}/${file}`, minified, function(err) {

            if(err) {

                console.log(err);

            } else {

                console.log(`${file} was successfully minified.`);

            }

        });

    }

}


app.precheck(process.argv[2])