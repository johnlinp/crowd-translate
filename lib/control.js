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
        if (request.user) {
            response.redirect('/');
            return;
        }

        response.render('pages/login', {
            user: null
        });
    });

    app.get('/logout', function(request, response) {
        request.logout();
        response.redirect('/');
    });

    app.get('/posts', function(request, response) {
        if (!request.user) {
            response.redirect('/login');
            return;
        }

        response.render('pages/posts', {
            user: request.user
        });
    });

    app.get('/copy/:translationId', function(request, response) {
        if (!request.user) {
            response.redirect('/login');
            return;
        }

        models.Translation.findOne({ _id: request.params.translationId })
                .exec(function(err, translation) {
            if (err || !translation) {
                response.render('pages/error', {
                    errMsg: '這一個翻譯不存在喔',
                    user: request.user
                });
                return;
            }

            if (translation.author == request.user.id) {
                response.redirect('/edit/' + request.params.translationId);
                return;
            }

            models.copyTranslation(translation, request.user, function(err, newTranslation) {
                if (err) {
                    response.render('pages/error', {
                        errMsg: '我搞砸了',
                        user: request.user
                    });
                    return;
                }

                response.redirect('/edit/' + newTranslation.id);
            });
        });
    });

    app.get('/edit/:translationId', function(request, response) {
        if (!request.user) {
            response.redirect('/login');
            return;
        }

        models.Translation.findOne({ _id: request.params.translationId })
                .exec(function(err, translation) {
            if (err || !translation) {
                response.render('pages/error', {
                    errMsg: '這一個翻譯不存在喔',
                    user: request.user
                });
                return;
            }

            if (translation.author != request.user.id) {
                response.render('pages/error', {
                    errMsg: '這不是你的翻譯喔',
                    user: request.user
                });
                return;
            }

            response.render('pages/edit', {
                user: request.user
            });
        });
    });
};

var setApiPaths = function(app) {
    app.get('/api/myself', function(request, response) {
        if (!request.user) {
            response.json({ login: false });
            return;
        }

        response.json({
            login: true,
            id: request.user.id,
            displayName: request.user.displayName,
        });
    });

    app.get('/api/translation/list', function(request, response) {
        models.Translation.find({ published: true })
                .populate('original')
                .populate('author')
                .exec(function(err, translations) {
            if (err) throw err;

            response.json(translations);
        });
    });

    app.get('/api/translation/list/mine', function(request, response) {
        if (!request.user) {
            response.json([]);
            return;
        }

        models.Translation.find({ author: request.user })
                .populate('original')
                .populate('author')
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

