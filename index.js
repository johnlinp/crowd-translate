var express = require('express');

var control = require('./lib/control.js');

var app = express();

control.init(app);
control.setPaths(app);
control.start(app);

