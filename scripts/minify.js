const uglifyjs = require("uglify-js") //uglify-js@2
const fs = require("fs")
const path = require("path")

const fileMethods = ["isDirectory", "isFile"]

const writeFiles = (filePath, files) => {
  files.forEach(function (file) {
    // check whether 'file' is file or directory
    const cur = { name: file.name }
    for (const method of fileMethods) {
      cur[method] = file[method]()
    }

    if (cur.isFile) {
      var result = uglifyjs.minify(`${filePath}/${cur.name}`)
      app.writer(result.code, filePath, cur.name)
    } else if (cur.isDirectory) {
      readDir(`${filePath}/${cur.name}`)
    }
  })
}

const readDir = (filePath) => {
  fs.readdir(filePath, { withFileTypes: true }, function (err, files) {
    if (err) {
      return console.log("Unable to read directory: " + err)
    }

    writeFiles(filePath, files)
  })
}

var app = {
  precheck: (destination) => {
    if (destination != "") {
      app.reader(destination)
    }
  },

  reader: (destination) => {
    const chartsPath = path.join(__dirname, "..", destination)
    readDir(chartsPath)
  },

  writer: (minified, url, file) => {
    fs.writeFile(`${url}/${file}`, minified, function (err) {
      if (err) {
        console.log(err)
      } else {
        console.log(`${file} was successfully minified.`)
      }
    })
  }
}

app.precheck(process.argv[2])
