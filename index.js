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
                    width: Number,
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

app.get('/', function(request, response) {
    response.render('pages/index');
});

app.get('/contribute', function(request, response) {
    response.render('pages/contribute');
});

app.get('/api/translations', function(request, response) {
    Translation.find()
            .populate('original')
            .exec(function(err, translations) {
        if (err) throw err;

        response.json(translations);
    });
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});


