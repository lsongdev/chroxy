const http = require('http');
const kelp = require('kelp');
const send = require('kelp-send');
const body = require('kelp-body');
const Router = require('kelp-router');

const app = kelp();

app.use(send);
app.use(body);

http.createServer(app).listen(3000);
