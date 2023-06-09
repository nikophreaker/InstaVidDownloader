const express = require("express");
const app = express();
const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

const path = require("path");
const childProcess = require("child_process");

// path to PhantomJS bin
const phantomJsPath = require("phantomjs-prebuilt").path;

const PORT = process.env.PORT || 8080;
app.use(express.static("./"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "index.html");
});

app.use(express.json());
app.post("/action", (req, res) => {
    // console.log(req);
    console.log(phantomJsPath);
    console.log(req.body.url);
    fetch(req.body.url, (err) => {
        console.log(err);
    }, (success) => {
        var contentUrl = success.substring(success.indexOf('https:\\/\\/video.cdninstagram.com'), success.indexOf('","thumbnailUrl"')).replaceAll("\\", "").replaceAll("u0025", "%");
        res.send(contentUrl);
        fs.writeFile("html.txt", contentUrl, (err) => {
            if (err)
                console.log(err);
            else {
                console.log("File written successfully\n");
                // console.log("The written has the following contents:");
                // console.log(fs.readFileSync("html.txt", "utf8"));
            }
        });
        console.log(contentUrl);
    });
});

app.listen(PORT, () => {
    console.log(`Listen to Port: ${PORT}`);
});

function fetch(url, reject, resolve) {
    // execute phantom-script.js file via PhantomJS
    const childArgs = [path.join(__dirname, "phantom-script.js")];
    const phantom = childProcess.execFile(phantomJsPath, childArgs, {
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
    console.log(childArgs);
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