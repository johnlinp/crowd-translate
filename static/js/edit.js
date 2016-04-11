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
    handleWordsChange: function(idx, evt) {
        var state = this.state;
        state.translation.texts[idx].content.words = evt.target.value;
        this.setState(state);
    },
    handleOverlayTextureChange: function(idx, evt) {
        var state = this.state;
        state.translation.texts[idx].overlay.texture = evt.target.value;
        this.setState(state);
    },
    handleFillColorChange: function(idx, evt) {
        var state = this.state;
        state.translation.texts[idx].overlay.fillColor = evt.target.value;
        this.setState(state);
    },
    handleTextColorChange: function(idx, evt) {
        var state = this.state;
        state.translation.texts[idx].content.textColor = evt.target.value;
        this.setState(state);
    },
    handleTextShadowColorChange: function(idx, evt) {
        var state = this.state;
        state.translation.texts[idx].content.textShadowColor = evt.target.value;
        this.setState(state);
    },
    handleFontSizeChange: function(idx, evt) {
        var state = this.state;
        state.translation.texts[idx].content.fontSize = evt.target.value;
        this.setState(state);
    },
    makeBlurOverlayStyle: function(text) {
        var overlay = text.overlay;
        return {
            clip: 'rect(' +
                    overlay.rect.top + 'px,' +
                    overlay.rect.right + 'px,' +
                    overlay.rect.bottom + 'px,' +
                    overlay.rect.left + 'px)',
        };
    },
    makeBlockOverlayOutterStyle: function(text) {
        var overlay = text.overlay;
        return {
            top: overlay.rect.top + 'px',
            left: overlay.rect.left + 'px',
        };
    },
    makeBlockOverlayInnerStyle: function(text) {
        var overlay = text.overlay;
        return {
            fill: overlay.fillColor,
        };
    },
    makeContentStyle: function(text) {
        var content = text.content;
        var style = {
            top: content.rect.top + 'px',
            left: content.rect.left + 'px',
            width: content.rect.width + 'px',
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
    makeOverlayNode: function(text, imageUrl) {
        var overlay = text.overlay;
        if (overlay.texture == 'blur') {
            return (
                <div className="ct-text ct-blur-overlay" style={this.makeBlurOverlayStyle(text)}>
                    <img src={imageUrl}></img>
                </div>
            );
        } else if (overlay.texture == 'block') {
            return (
                <div className="ct-text" style={this.makeBlockOverlayOutterStyle(text)}>
                    <svg style={{width: '100%', height: 'auto'}}>
                        <rect
                                width={overlay.rect.right - overlay.rect.left}
                                height={overlay.rect.bottom - overlay.rect.top}
                                style={this.makeBlockOverlayInnerStyle(text)} />
                    </svg>
                </div>
            );
        }

        return <div></div>;
    },
    makeContentNode: function(text) {
        return (
            <div className="ct-text" style={this.makeContentStyle(text)}>
                {text.content.words}
            </div>
        );
    },
    createLeftPanel: function() {
        var me = this;
        var imageUrl = this.state.translation.original.imageUrl;
        var imageTextNodes = this.state.translation.texts.map(function(text, idx) {
            return (
                <div key={idx}>
                    {me.makeOverlayNode(text, imageUrl)}
                    {me.makeContentNode(text)}
                </div>
            );
        });

        return (
            <div>
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
        );
    },
    createRightPanel: function() {
        var me = this;
        var typeTextNodes = this.state.translation.texts.map(function(text, idx) {
            return (
                <div key={idx}>
                    <textarea className="form-control"
                            value={text.content.words}
                            onChange={me.handleWordsChange.bind(me, idx)} />

                    <div>
                        <div className="radio">
                            <label>
                                <input type="radio"
                                        name={'texture-' + idx}
                                        value="blur"
                                        checked={text.overlay.texture == 'blur'}
                                        onChange={me.handleOverlayTextureChange.bind(me, idx)} />
                                <span>模糊</span>
                            </label>
                        </div>
                        <div className="radio">
                            <label>
                                <input type="radio"
                                        name={'texture-' + idx}
                                        value="block"
                                        checked={text.overlay.texture == 'block'}
                                        onChange={me.handleOverlayTextureChange.bind(me, idx)} />
                                <span>色塊</span>
                            </label>
                        </div>
                    </div>

                    <label>色塊顏色</label>
                    <input type="text" className="form-control"
                            value={text.overlay.fillColor}
                            onChange={me.handleFillColorChange.bind(me, idx)} />

                    <label>文字顏色</label>
                    <input type="text" className="form-control"
                            value={text.content.textColor}
                            onChange={me.handleTextColorChange.bind(me, idx)} />

                    <label>文字陰影顏色</label>
                    <input type="text" className="form-control"
                            value={text.content.textShadowColor}
                            onChange={me.handleTextShadowColorChange.bind(me, idx)} />

                    <label>文字大小</label>
                    <input type="text" className="form-control"
                            value={text.content.fontSize}
                            onChange={me.handleFontSizeChange.bind(me, idx)} />

                    <hr></hr>
                </div>
            );
        });

        return (
            <div>
                {typeTextNodes}
            </div>
        );
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

        return (
            <div>
                <div className="col-md-5 col-md-offset-1">
                    {this.createLeftPanel()}
                </div>
                <div className="col-md-5">
                    {this.createRightPanel()}
                </div>
            </div>
        );
    }
});

ReactDOM.render(
    <EditPanel />,
    document.getElementById('content')
);

