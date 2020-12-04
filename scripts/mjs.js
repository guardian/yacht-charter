var watch = require("node-watch")
const fs = require("fs")
const path = require("path")
const { exec } = require("child_process")

var watchmen = path.join(__dirname, "..", "charts")

watch(watchmen, { recursive: true }, function (evt, mjs) {
  compile(mjs)
})

function compile(name) {
  exec(
    "npx babel ./charts/ -d ./src/modules/charts/",
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        return
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        return
      }
      console.log(`stdout: ${stdout}`)
    }
  )
}
