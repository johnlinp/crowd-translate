var express = require('express');
var mongoose = require('mongoose');
var everyauth = require('everyauth');

mongoose.connect(process.env.MONGOLAB_URI, function(err, res) {
    if (err) throw err;
});

var Original = mongoose.model('Original', new mongoose.Schema({
    sourceType: String,
    pageUrl: String,
    imageUrl: String,
    title: String,
}));

var Translation = mongoose.model('Translation', new mongoose.Schema({
    original: {type: mongoose.Schema.Types.ObjectId, ref: 'Original'},
    language: String,
    title: String,
    texts: [
        {
            content: {
                words: String,
                fontSize: Number,
                textColor: String,
                textShadowColor: String,
                rect: {
                    top: Number,
                    left: Number,
                    bottom: Number,
                    right: Number,
                }
            },
            overlay: {
                texture: String,
                fillColor: String,
                rect: {
                    top: Number,
                    left: Number,
                    bottom: Number,
                    right: Number,
                }
            },
        }
    ],
}));

everyauth.google
    .appId(process.env.GOOGLE_CLIENT_ID)
    .appSecret(process.env.GOOGLE_CLIENT_SECRET)
    .scope('https://www.googleapis.com/auth/plus.me')
    .entryPath('/auth/google')
    .redirectPath('/')
    .handleAuthCallbackError(function(req, res) {
    })
    .findOrCreateUser(function(session, accessToken, accessTokenExtra, googleUserMetadata) {
    });

var app = express();

app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/static'));
app.use(everyauth.middleware(app));

app.get('/', function(request, response) {
    response.render('pages/index');
});

app.get('/contribute', function(request, response) {
    response.render('pages/contribute');
});

app.get('/login', function(request, response) {
    response.render('pages/login');
});

app.get('/edit/:translationId', function(request, response) {
    response.render('pages/edit');
});

app.get('/api/translation/list', function(request, response) {
    Translation.find()
            .populate('original')
            .exec(function(err, translations) {
        if (err) throw err;

        response.json(translations);
    });
});

app.get('/api/translation/get/:translationId', function(request, response) {
    Translation.findOne({_id: request.params.translationId})
            .populate('original')
            .exec(function(err, translation) {
        if (err) throw err;

        response.json(translation);
    });
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});


