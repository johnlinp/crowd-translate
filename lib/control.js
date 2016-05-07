var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var http = require('http');

var auth = require('./auth.js');
var models = require('./models.js');

var renderError = function(request, response, errMsg) {
    errMsg = errMsg || '我搞砸了';
    response.render('pages/error', {
        errMsg: errMsg,
        user: request.user
    });
}

var retrieveJson = function(url, success, error) {
    http.get(url, function(result) {
        var body = '';

        result.on('data', function(chunk) {
            body += chunk;
        });

        result.on('end', function() {
            var json = JSON.parse(body);
            success(json);
        });
    }).on('error', function(err) {
        error(err);
    });
};

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

    app.post('/translate', function(request, response) {
        if (!request.user) {
            response.redirect('/login');
            return;
        }

        var matches = request.body.url.match(/9gag.com\/gag\/(\w+)/);
        if (!matches) {
            renderError(request, response, '網址怪怪的喔');
            return;
        }

        var gagId = matches[1];
        var gagUrl = 'http://9gag.com/gag/' + gagId;

        models.Original.findOne({ pageUrl: gagUrl })
                .exec(function(err, original) {
            if (err) {
                renderError(request, response);
                return;
            }

            if (original) {
                models.Translation.findOne({ original: original, author: request.user })
                    .exec(function(err, translation) {
                    if (err) {
                        renderError(request, response);
                        return;
                    }

                    if (translation) {
                        response.redirect('/edit/' + translation.id);
                    } else {
                        models.createTranslation({
                            original: original,
                            author: request.user,
                        }, function(err, translation) {
                            if (err) {
                                renderError(request, response);
                                return;
                            }

                            response.redirect('/edit/' + translation.id);
                        });
                    }
                });
            } else {
                var gagApiUrl = 'http://infinigag.k3min.eu/gag/' + gagId;
                retrieveJson(gagApiUrl, function(json) {
                    if (json.status != 200) {
                        renderError(request, response, '找不到這篇喔');
                        return;
                    }

                    models.createOriginal({
                        sourceType: '9gag',
                        pageUrl: gagUrl,
                        imageUrl: json.images.normal,
                        title: json.caption,
                    }, function(err, original) {
                        if (err) {
                            renderError(request, response);
                            return;
                        }

                        models.createTranslation({
                            original: original,
                            author: request.user,
                        }, function(err, translation) {
                            if (err) {
                                renderError(request, response);
                                return;
                            }

                            response.redirect('/edit/' + translation.id);
                        });
                    });
                }, function(err) {
                    renderError(request, response, '這一篇好像怪怪的');
                });
            }
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
                renderError(request, response, '這一個翻譯不存在喔');
                return;
            }

            if (translation.author == request.user.id) {
                response.redirect('/edit/' + request.params.translationId);
                return;
            }

            models.copyTranslation(translation, request.user, function(err, newTranslation) {
                if (err) {
                    renderError(request, response);
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
                renderError(request, response, '這一個翻譯不存在喔');
                return;
            }

            if (translation.author != request.user.id) {
                renderError(request, response, '這不是你的翻譯喔');
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

    app.get('/api/fresh/list', function(request, response) {
        var gagApiUrl = 'http://infinigag.k3min.eu/hot/';
        var freshs = [];
        retrieveJson(gagApiUrl, function(json) {
            if (json.status != 200) {
                response.json(freshs);
                return;
            }

            json.data.forEach(function(gag) {
                if (gag.media) {
                    return;
                }

                freshs.push({
                    title: gag.caption,
                    imageUrl: gag.images.normal,
                    pageUrl: gag.link,
                });
            });

            response.json(freshs);
        }, function(err) {
            response.json(freshs);
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
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

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

