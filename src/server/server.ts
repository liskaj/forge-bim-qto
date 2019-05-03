'use strict';

import * as express from 'express';
import * as bodyParser from 'body-parser';

import { ApiController, ApiControllerOptions } from './apiController';

const app = express();

app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(bodyParser.json({ limit: '1mb' }));
app.use('/', express.static(__dirname + '/../../app'));
// load configuration
const options: ApiControllerOptions = {
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET
};

// endpoints
const apiCtrl = new ApiController(options);

app.use('/api/v1', apiCtrl.router);
// set port and start server
const port = process.env.PORT || 3000;

app.set('port', port);
app.listen(port, () => {
    // tslint:disable-next-line
    console.log('Server is listening on port ' + port);
});
