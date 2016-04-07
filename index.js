var express = require('express');
var mongoose = require('mongoose');

var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/static'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

mongoose.connect(process.env.MONGOLAB_URI, function(err, res) {
    if (err) throw err;
});

var Post = mongoose.model('Post', new mongoose.Schema({
    sourceType: String,
    pageUrl: String,
    imageUrl: String,
    title: String,
}));

var Translation = mongoose.model('Translation', new mongoose.Schema({
    post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'},
    language: String,
    title: String,
    texts: [
        {
            content: {
                words: String,
                fontSize: Number,
                rect: {
                    top: Number,
                    left: Number,
                    width: Number,
                }
            },
            overlay: {
                texture: String,
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

app.get('/', function(request, response) {
    Translation.find().populate('post').exec(function(err, translations) {
        if (err) throw err;

        response.render('pages/index', {translations: translations});
    });
});

app.get('/contribute', function(request, response) {
    response.render('pages/contribute');
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});


