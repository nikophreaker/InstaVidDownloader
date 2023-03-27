const express = require("express");
const app = express();
const fs = require("fs");
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const router = express.Router();
const path = require("path");
const childProcess = require("child_process");

// path to PhantomJS bin
// const phantomJsPath = require("phantomjs-prebuilt").path;
const phantomJsPath = require("phantomjs-prebuilt").path;

const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
// app.use(express.static("./"));
router.get("/", (req, res) => {
    res.sendFile(__dirname + '../index.html');
    // res.send("<p>Connected</p>");
});

router.get("/test", (req, res) => {
    // res.sendFile(__dirname + '../index.html');
    res.send("<p>Connected</p>");
});

// app.use(bodyParser.json());
router.post("/action", async (req, res) => {
    // console.log(req);
    console.log(req.body.url);
    console.log(phantomJsPath);
    fs.readdir("/opt", (err, files) => {
        files.forEach((value) => {
            console.log(value);
        })
    });
    // res.send(phantomJsPath);
    fetch(req.body.url, (err) => {
        console.log(`FetchErr: ${err}`);
        res.send("<p>Error</p>");
    }, (success) => {
        var succesToJSON = JSON.parse(success);
        console.log(succesToJSON.video[0].contentUrl);
        var contentUrl = succesToJSON.video[0].contentUrl;
        res.send(contentUrl);
        // fs.writeFile("html.txt", contentUrl, (err) => {
        //     if (err)
        //         console.log(err);
        //     else {
        //         console.log("File written successfully\n");
        //         // console.log("The written has the following contents:");
        //         // console.log(fs.readFileSync("html.txt", "utf8"));
        //     }
        // });

        // fs.writeFile("full.json", success, (err) => {
        //     if (err)
        //         console.log(err);
        //     else {
        //         console.log("File written successfully2\n");
        //         // console.log("The written has the following contents:");
        //         // console.log(fs.readFileSync("html.txt", "utf8"));
        //     }
        // });
    });
});

app.use('/.netlify/functions/server', router); // path must route to lambda
app.use('/.netlify/functions/server/test', router); // path must route to lambda
app.use('/.netlify/functions/server/action', router); // path must route to lambda
// app.use('/', (req, res) => res.sendFile(__dirname + './index.html'));

// exports = app;
exports.handler = serverless(app);
// app.listen(PORT, () => {
//     console.log(`Listen to Port: ${PORT}`);
// });

function fetch(url, reject, resolve) {
    // execute phantom-script.js file via PhantomJS
    const childArgs = [path.join(__dirname, "phantom-script.js")];
    const phantom = childProcess.execFile("/opt/build/repo/phantomjs.exe", childArgs, {
        env: {
            URL: url
        },
        // maxBuffer: 2048 * 1024
    });
    // const phantom = childProcess.execFile(phantomJsPath, {
    //     env: {
    //         URL: url
    //     },
    //     maxBuffer: 2048 * 1024
    // });
    let stdout = "";
    let stderr = "";

    // data comes gradually, bit by bit
    phantom.stdout.on("data", function (chunk) {
        stdout += chunk;
    });

    phantom.stderr.on("data", function (chunk) {
        stderr += chunk;
    });

    phantom.on("uncaughtException", function (err) {
        console.log("uncaught exception: " + err);
    });

    phantom.on("exit", function (exitCode) {
        if (exitCode !== 0) {
            return reject(stderr);
        }

        resolve(stdout);
    });
};