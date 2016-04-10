var EditPanel = React.createClass({
    getTranslationId: function() {
        var matches = location.pathname.match('/edit/(.*)');

        if (!matches || matches.length != 2) {
            return '';
        }

        return matches[1];
    },
    loadTranslationFromServer: function() {
        var me = this;
        var translationId = this.getTranslationId();
        $.get('/api/translation/get/' + translationId, function(translation) {
            me.setState({translation: translation});
        }, 'json');
    },
    handleTitleChange: function(evt) {
        var state = this.state;
        state.translation.title = evt.target.value;
        this.setState(state);
    },
    getInitialState: function() {
        return {translation: null};
    },
    componentDidMount: function() {
        this.loadTranslationFromServer();
    },
    render: function() {
        if (!this.state.translation) {
            return <div></div>;
        }

        var imageTextNodes = this.state.translation.texts.map(function(text) {
            return <div>{text.content.words}</div>;
        });

        var typeTextNodes = this.state.translation.texts.map(function(text) {
            return <div>{text.content.words}</div>;
        });

        return (
            <div>
                <div className="col-md-5 col-md-offset-1">
                    <div>
                        <input type="text" className="form-control input-lg"
                                value={this.state.translation.title}
                                onChange={this.handleTitleChange} />
                    </div>
                    <div className="ct-image">
                        <img src={this.state.translation.original.imageUrl}></img>
                        {imageTextNodes}
                    </div>
                </div>
                <div className="col-md-5 col-md-offset-6">
                    {typeTextNodes}
                </div>
            </div>
        );
    }
});

ReactDOM.render(
    <EditPanel />,
    document.getElementById('content')
);

