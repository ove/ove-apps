const { Constants } = require('./client/constants/html');
const HttpStatus = require('http-status-codes');
const path = require('path');
const fs = require('fs');
const { express, app, log, Utils } = require('@ove-lib/appbase')(__dirname, Constants.APP_NAME);
const request = require('request');
const server = require('http').createServer(app);

// Expose the distributed JS library and helper scripts.
app.use('/libs/:name(distributed).js', function (req, res) {
    request('http://' + process.env.OVE_HOST + '/jquery.min.js', function (err, _res, body) {
        if (err) {
            log.error('Failed to load jquery:', err);
            Utils.sendMessage(res, HttpStatus.BAD_REQUEST,
                JSON.stringify({ error: 'failed to load dependency' }));
        } else {
            let text = body + '\n';
            request('http://' + process.env.OVE_HOST + '/ove.js', function (err, _res, body) {
                if (err) {
                    log.error('Failed to load ove.js:', err);
                    Utils.sendMessage(res, HttpStatus.BAD_REQUEST,
                        JSON.stringify({ error: 'failed to load dependency' }));
                } else {
                    text += body + '\n' +
                        fs.readFileSync(path.join(__dirname, 'libs', req.params.name + '.js'));
                    res.set(Constants.HTTP_HEADER_CONTENT_TYPE, Constants.HTTP_CONTENT_TYPE_JS).send(text
                        .replace(/__OVEHOST__/g, process.env.OVE_HOST));
                }
            });
        }
    });
});
app.use('/libs/distributed', express.static(path.join(__dirname, 'libs', 'distributed')));

const port = process.env.PORT || 8080;
server.listen(port);
log.info(Constants.APP_NAME, 'application started, port:', port);
