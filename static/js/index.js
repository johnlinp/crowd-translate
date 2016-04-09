var Translation = React.createClass({
    render: function() {
        var me = this;
        var textNodes = this.props.translation.texts.map(function(text) {
            var imageUrl = me.props.translation.original.imageUrl;
            var key = JSON.stringify(text.overlay.rect) + JSON.stringify(text.content.rect);
            return (
                <TranslationText text={text} imageUrl={imageUrl} key={key}>
                </TranslationText>
            );
        });
        return (
            <div className="col-md-6 col-md-offset-3">
                <div><h2>{this.props.translation.title}</h2></div>
                <div className="ct-image">
                    <img src={this.props.translation.original.imageUrl}></img>
                    {textNodes}
                </div>
                <div>
                    <div className="btn-group" role="group">
                        <button type="button" className="btn btn-default">出處</button>
                        <button type="button" className="btn btn-default">修正</button>
                    </div>
                </div>
                <hr></hr>
            </div>
        );
    }
});

var TranslationText = React.createClass({
    render: function() {
        return (
            <div>
                <div className="ct-blur-overlay" style={{clip: 'rect(' +
                        this.props.text.overlay.rect.top + 'px,' +
                        this.props.text.overlay.rect.right + 'px,' +
                        this.props.text.overlay.rect.bottom + 'px,' +
                        this.props.text.overlay.rect.left + 'px)'}}>
                    <img src={this.props.imageUrl}></img>
                </div>
                <div className="ct-caption" style={{
                        top: this.props.text.content.rect.top + 'px',
                        left: + this.props.text.content.rect.left + 'px',
                        width: + this.props.text.content.rect.width + 'px',
                        fontSize: + this.props.text.content.fontSize + 'px'}}>
                    {this.props.text.content.words}
                </div>
            </div>
        );
    }
});

var TranslationList = React.createClass({
    loadTranslationsFromServer: function() {
        var me = this;
        $.get('/api/translations', function(translations) {
            me.setState({translations: translations});
        }, 'json');
    },
    getInitialState: function() {
        return {translations: []};
    },
    componentDidMount: function() {
        this.loadTranslationsFromServer();
    },
    render: function() {
        var translationNodes = this.state.translations.map(function(translation) {
            return (
                <Translation translation={translation} key={translation._id}>
                </Translation>
            );
        });
        return (
            <div>
                {translationNodes}
            </div>
        );
    }
});

ReactDOM.render(
    <TranslationList />,
    document.getElementById('content')
);

