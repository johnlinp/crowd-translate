var express = require('express');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

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
    displayName: String,
    googleId: String,
    twitterId: String,
}));

var findOrCreateUser = function(socialKey, profile, done) {
    var query = {};
    query[socialKey] = profile.id;

    User.findOne(query).exec(function(err, user) {
        if (user) {
            done(err, user);
            return;
        }

        user = new User();
        user.displayName = profile.displayName;
        user[socialKey] = profile.id;
        user.save(function(err) {
            done(err, user);
        });
    });
};

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
    findOrCreateUser('googleId', profile, done);
}));

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_ID,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: "/auth/twitter/callback"
}, function(accessToken, refreshToken, profile, done) {
    findOrCreateUser('twitterId', profile, done);
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

app.get('/auth/twitter', passport.authenticate('twitter', {
    scope: ['https://www.googleapis.com/auth/plus.login']
}));

app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), function(request, response) {
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


