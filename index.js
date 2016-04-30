var express = require('express');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

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

var User = mongoose.model('User', new mongoose.Schema({
    provider: String,
    socialId: String,
    displayName: String,
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, function(accessToken, refreshToken, profile, done) {
    User.findOne({ provider: 'google', socialId: profile.id })
            .exec(function(err, user) {
        if (err) throw err;

        if (user) {
            done(err, user);
            return;
        }

        user = new User();
        user.provider = 'google';
        user.socialId = profile.id;
        user.displayName = profile.displayName;
        user.save(function(err) {
            if (err) throw err;

            done(err, user);
        });
    });
}));

var app = express();

app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/static'));
app.use(cookieParser('htuayreve'));
app.use(session());
app.use(passport.initialize());
app.use(passport.session());

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

app.get('/auth/google', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login']
}));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(request, response) {
    response.redirect('/');
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


