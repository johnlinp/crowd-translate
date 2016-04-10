var React = require('react');
var ReactDOM = require('react-dom');
var classes = require('./classes.js');

var TranslationList = classes.TranslationList;

ReactDOM.render(
    <TranslationList />,
    document.getElementById('content')
);

