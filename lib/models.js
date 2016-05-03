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
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    language: String,
    title: String,
    published: Boolean,
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

module.exports.createOriginal = function(config, callback) {
    var original = new module.exports.Original(config);
    original.save(function(err) {
        callback(err, original);
    });
};

module.exports.copyTranslation = function(oldTranslation, user, callback) {
    var newTranslation = new module.exports.Translation(oldTranslation);
    newTranslation._id = mongoose.Types.ObjectId();;
    newTranslation.isNew = true;
    newTranslation.author = user;
    newTranslation.published = false;
    newTranslation.save(function(err) {
        callback(err, newTranslation);
    });
};

module.exports.createTranslation = function(config, callback) {
    var translation = new module.exports.Translation(config);
    translation.language = 'zh-TW';
    translation.title = translation.original.title;
    translation.published = false;
    translation.texts = [];
    translation.save(function(err) {
        callback(err, translation);
    });
};
