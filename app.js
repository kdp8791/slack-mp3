var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var exec = require('child_process').exec
var uuid = require('node-uuid');
var request = require('request');
var util = require('util');

const DOMAIN = '';
const FILE_PATH = '';

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

function isValid(value) {
    return typeof value !== 'undefined' && value != '' && value.indexOf('youtube') > -1;
}

function getAudio(yt_url, ok_cb, err_cb) {
    var id = uuid.v4();
    var cmd = util.format('youtube-dl -x --audio-format mp3 --audio-quality 0 --no-mtime -o "%s.%(ext)s" --exec "mv {} %s" %s', id, FILE_PATH, yt_url);
    exec(cmd, function(error, stdout, stderr) {
        if (stdout != null && stdout != '') {
            ok_cb(util.format('%s/%s.mp3', domain, id));
        } else if (error != null && error != '') {
            err_cb();
            console.log(error);
        } else {
            err_cb();
            console.log(stderr);
        }
    });
}

app.post('/request', (req, res) => {
    if (isValid(req.body.text)) {
        var delayed_response_url = req.body.response_url;
        getAudio(req.body.text, function (audio_link) {
            var json = {
                'response_type': 'in_channel',
                'text': audio_link
            };
            request({
                url: delayed_response_url,
                method: "POST",
                json: true,
                body: json
            }, function () {
                res.end();
            });
        }, function () {
            var json = {
                'response_type': 'in_channel',
                'text': 'An error occurred. Check logs for further details.'
            };
            request({
                url: delayed_response_url,
                method: "POST",
                json: true,
                body: json
            }, function () {
                res.end();
            });
        });

        res.send('Working on it...');
    } else {
        res.send('Missing Youtube Link.');
    }
});

app.listen(8001, '127.0.0.1', () => {
    console.log('Started app, listening on 8001');
});
