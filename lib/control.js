var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var auth = require('./auth.js');
var models = require('./models.js');

var setPagePaths = function(app) {
    app.get('/', function(request, response) {
        response.render('pages/index', {
            user: request.user
        });
    });

    app.get('/contribute', function(request, response) {
        response.render('pages/contribute', {
            user: request.user
        });
    });

    app.get('/login', function(request, response) {
        response.render('pages/login', {
            user: request.user
        });
    });

    app.get('/logout', function(request, response) {
        request.logout();
        response.redirect('/');
    });

    app.get('/edit/:translationId', function(request, response) {
        response.render('pages/edit', {
            user: request.user
        });
    });
};

var setApiPaths = function(app) {
    app.get('/api/translation/list', function(request, response) {
        models.Translation.find()
                .populate('original')
                .exec(function(err, translations) {
            if (err) throw err;

            response.json(translations);
        });
    });

    app.get('/api/translation/get/:translationId', function(request, response) {
        models.Translation.findOne({_id: request.params.translationId})
                .populate('original')
                .exec(function(err, translation) {
            if (err) throw err;

            response.json(translation);
        });
    });
};

module.exports = {};

module.exports.init = function(app) {
    auth.init();

    app.set('port', (process.env.PORT || 5000));
    app.set('views', __dirname + '/../views');
    app.set('view engine', 'ejs');

    app.use(express.static(__dirname + '/../static'));
    app.use(cookieParser('htuayreve'));
    app.use(session());

    auth.setApp(app);
};

module.exports.setPaths = function(app) {
    setPagePaths(app);
    setApiPaths(app);
};

module.exports.start = function(app) {
    app.listen(app.get('port'), function() {
        console.log('Node app is running on port', app.get('port'));
    });
};

