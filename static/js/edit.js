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
            me.setState({
                translation: translation,
                focusTextIdx: -1,
            });
        }, 'json');
    },
    handleTitleChange: function(evt) {
        var state = this.state;
        state.translation.title = evt.target.value;
        this.setState(state);
    },
    handleWordsFocus: function(idx, evt) {
        this.state.focusTextIdx = idx;
        this.setState(this.state);
    },
    handleWordsChange: function(idx, evt) {
        var text = this.state.translation.texts[idx];
        text.content.words = evt.target.value;
        this.setState(this.state);
    },
    handleOverlayTextureChange: function(evt) {
        var idx = this.state.focusTextIdx;
        if (idx == -1) {
            return;
        }

        var text = this.state.translation.texts[idx];
        text.overlay.texture = evt.target.value;
        this.setState(this.state);
    },
    handleFillColorChange: function(evt) {
        var idx = this.state.focusTextIdx;
        if (idx == -1) {
            return;
        }

        var text = this.state.translation.texts[idx];
        text.overlay.fillColor = evt.target.value;
        this.setState(this.state);
    },
    handleTextColorChange: function(evt) {
        var idx = this.state.focusTextIdx;
        if (idx == -1) {
            return;
        }

        var text = this.state.translation.texts[idx];
        text.content.textColor = evt.target.value;
        this.setState(this.state);
    },
    handleTextShadowColorChange: function(evt) {
        var idx = this.state.focusTextIdx;
        if (idx == -1) {
            return;
        }

        var text = this.state.translation.texts[idx];
        text.content.textShadowColor = evt.target.value;
        this.setState(this.state);
    },
    handleFontSizeChange: function(evt) {
        var idx = this.state.focusTextIdx;
        if (idx == -1) {
            return;
        }

        var text = this.state.translation.texts[idx];
        text.content.fontSize = evt.target.value;
        this.setState(this.state);
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
    makeBorderNode: function(text, textIdx) {
        var overlay = text.overlay;
        var visibility = (textIdx == this.state.focusTextIdx) ? 'visible' : 'hidden';

        return (
            <div className="ct-text" style={{top: '0px', left: '0px', height: '100%'}}>
                <svg style={{width: '100%', height: '100%'}}>
                    <rect
                            x={overlay.rect.left}
                            y={overlay.rect.top}
                            width={overlay.rect.right - overlay.rect.left}
                            height={overlay.rect.bottom - overlay.rect.top}
                            style={{visibility: visibility, strokeWidth: 3, stroke: '#66b1e4', fillOpacity: '0'}} />
                </svg>
            </div>
        );
    },
    makeOverlayNode: function(text, imageUrl, textIdx) {
        var overlay = text.overlay;
        if (overlay.texture == 'blur') {
            return (
                <div>
                    <div className="ct-text ct-blur-overlay" style={this.makeBlurOverlayStyle(text)}>
                        <img src={imageUrl}></img>
                    </div>
                    {this.makeBorderNode(text, textIdx)}
                </div>
            );
        } else if (overlay.texture == 'block') {
            return (
                <div>
                    <div className="ct-text" style={{top: '0px', left: '0px', height: '100%'}}>
                        <svg style={{width: '100%', height: '100%'}}>
                            <rect
                                    x={overlay.rect.left}
                                    y={overlay.rect.top}
                                    width={overlay.rect.right - overlay.rect.left}
                                    height={overlay.rect.bottom - overlay.rect.top}
                                    style={{fill: overlay.fillColor}} />
                        </svg>
                    </div>
                    {this.makeBorderNode(text, textIdx)}
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
                    {me.makeOverlayNode(text, imageUrl, idx)}
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
    createTextEditArea: function() {
        var focusTextIdx = this.state.focusTextIdx;

        if (focusTextIdx == -1) {
            return <div></div>;
        }

        var text = this.state.translation.texts[this.state.focusTextIdx];

        return (
            <div>
                <label>文字背景</label>
                <div>
                    <div className="radio">
                        <label>
                            <input type="radio"
                                    name='texture'
                                    value="blur"
                                    checked={text.overlay.texture == 'blur'}
                                    onChange={this.handleOverlayTextureChange} />
                            <span>模糊</span>
                        </label>
                    </div>
                    <div className="radio">
                        <label>
                            <input type="radio"
                                    name='texture'
                                    value="block"
                                    checked={text.overlay.texture == 'block'}
                                    onChange={this.handleOverlayTextureChange} />
                            <span>色塊</span>
                        </label>
                    </div>
                </div>

                <label>色塊顏色</label>
                <input type="text" className="form-control"
                        disabled={text.overlay.texture != 'block'}
                        value={text.overlay.fillColor}
                        onChange={this.handleFillColorChange} />

                <label>文字顏色</label>
                <input type="text" className="form-control"
                        value={text.content.textColor}
                        onChange={this.handleTextColorChange} />

                <label>文字陰影顏色</label>
                <input type="text" className="form-control"
                        value={text.content.textShadowColor}
                        onChange={this.handleTextShadowColorChange} />

                <label>文字大小</label>
                <input type="text" className="form-control"
                        value={text.content.fontSize}
                        onChange={this.handleFontSizeChange} />
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
                            style={{background: me.state.focusTextIdx == idx ? '#dbedf9' : 'white'}}
                            onFocus={me.handleWordsFocus.bind(me, idx)}
                            onChange={me.handleWordsChange.bind(me, idx)} />
                    <hr></hr>
                </div>
            );
        });

        var textEditArea = this.createTextEditArea();

        return (
            <div>
                {typeTextNodes}
                {textEditArea}
            </div>
        );
    },
    getInitialState: function() {
        return {
            translation: null,
            focusTextIdx: -1,
        };
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

