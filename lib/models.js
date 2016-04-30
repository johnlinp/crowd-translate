var mongoose = require('mongoose');

mongoose.connect(process.env.MONGOLAB_URI, function(err, res) {
    if (err) throw err;
});

module.exports = {};

module.exports.Original = mongoose.model('Original', new mongoose.Schema({
    sourceType: String,
    pageUrl: String,
    imageUrl: String,
    title: String,
}));

module.exports.Translation = mongoose.model('Translation', new mongoose.Schema({
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

module.exports.User = mongoose.model('User', new mongoose.Schema({
    displayName: String,
    googleId: String,
    twitterId: String,
}));

module.exports.Author = mongoose.model('Author', new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    translation: {type: mongoose.Schema.Types.ObjectId, ref: 'Translation'},
}));

