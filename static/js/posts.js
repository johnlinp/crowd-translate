var Translation = React.createClass({
    render: function() {
        var me = this;

        if (!this.props.translation) {
            return <div></div>;
        }

        var textNodes = this.props.translation.texts.map(function(text) {
            var imageUrl = me.props.translation.original.imageUrl;
            var key = JSON.stringify(text.overlay.rect) + JSON.stringify(text.content.rect);
            return (
                <TranslationText text={text} imageUrl={imageUrl} key={key}>
                </TranslationText>
            );
        });

        return (
            <div>
                <div><h2>{this.props.translation.title}</h2></div>
                <div className="ct-image">
                    <img src={this.props.translation.original.imageUrl}></img>
                    {textNodes}
                </div>
                <div>
                    <div className="btn-group" role="group">
                        <a href={this.props.translation.original.pageUrl} target="_blank" className="btn btn-default">出處</a>
                        <a href={'/edit/' + this.props.translation._id} className="btn btn-default">編輯</a>
                    </div>
                </div>
                <hr></hr>
            </div>
        );
    }
});

var TranslationText = React.createClass({
    makeBlurOverlayStyle: function() {
        var overlay = this.props.text.overlay;
        return {
            clip: 'rect(' +
                    overlay.rect.top + 'px,' +
                    overlay.rect.right + 'px,' +
                    overlay.rect.bottom + 'px,' +
                    overlay.rect.left + 'px)',
        };
    },
    makeBlockOverlayOutterStyle: function() {
        var overlay = this.props.text.overlay;
        return {
            top: overlay.rect.top + 'px',
            left: overlay.rect.left + 'px',
        };
    },
    makeBlockOverlayInnerStyle: function() {
        var overlay = this.props.text.overlay;
        return {
            fill: overlay.fillColor,
        };
    },
    makeContentStyle: function() {
        var content = this.props.text.content;
        var style = {
            top: content.rect.top + 'px',
            left: content.rect.left + 'px',
            width: (content.rect.right - content.rect.left) + 'px',
            fontSize: content.fontSize + 'px',
            color: content.textColor,
        };

        if (content.textShadowColor) {
            style.textShadow =
                    '-1px 0 ' + content.textShadowColor + ',' +
                    '0 1px ' + content.textShadowColor + ',' +
                    '1px 0 ' + content.textShadowColor + ',' +
                    '0 -1px ' + content.textShadowColor;
        }

        return style;
    },
    makeOverlayNode: function() {
        var overlay = this.props.text.overlay;
        if (overlay.texture == 'blur') {
            return (
                <div className="ct-text ct-blur-overlay" style={this.makeBlurOverlayStyle()}>
                    <img src={this.props.imageUrl}></img>
                </div>
            );
        } else if (overlay.texture == 'block') {
            return (
                <div className="ct-text" style={this.makeBlockOverlayOutterStyle()}>
                    <svg>
                        <rect
                                width={overlay.rect.right - overlay.rect.left}
                                height={overlay.rect.bottom - overlay.rect.top}
                                style={this.makeBlockOverlayInnerStyle()} />
                    </svg>
                </div>
            );
        }

        return <div></div>;
    },
    makeContentNode: function() {
        return (
            <div className="ct-text" style={this.makeContentStyle()}>
                {this.props.text.content.words}
            </div>
        );
    },
    render: function() {
        return (
            <div>
                {this.makeOverlayNode()}
                {this.makeContentNode()}
            </div>
        );
    }
});

var TranslationList = React.createClass({
    loadTranslationsFromServer: function() {
        var me = this;
        $.get('/api/translation/list/mine', function(translations) {
            me.setState({translations: translations});
        }, 'json');
    },
    getInitialState: function() {
        return {translations: null};
    },
    componentDidMount: function() {
        this.loadTranslationsFromServer();
    },
    render: function() {
        var translations = this.state.translations;

        if (!translations) {
            return <div><center><h3>載入中…</h3></center></div>;
        }

        var translationNodes = translations.map(function(translation) {
            return (
                <div className="col-md-6 col-md-offset-3">
                    <Translation translation={translation} key={translation._id} mode="display">
                    </Translation>
                </div>
            );
        });

        var title = (
            <div className="col-md-6 col-md-offset-3">
                {(translations.length > 0) ? <div></div> : <h2>你還沒有翻譯過喔</h2>}
            </div>
        );

        return (
            <div>
                {title}
                {translationNodes}
            </div>
        );
    }
});

ReactDOM.render(
    <TranslationList />,
    document.getElementById('content')
);
