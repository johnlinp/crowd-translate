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
    handleSizingDotControlMouseDown: function(vertical, horizontal, evt) {
        this.state.sizingStatus = {
            vertical: vertical,
            horizontal: horizontal,
        };
        this.setState(this.state);
    },
    handleSizingDotControlMouseUp: function(evt) {
        if (!this.state.sizingStatus) {
            return;
        }

        this.state.sizingStatus = null;
        this.setState(this.state);
    },
    handleSizingDotControlMouseMove: function(evt) {
        if (!this.state.sizingStatus) {
            return;
        }
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
    makeSizingBorderDisplayNode: function(rect, strokeColor) {
        var rectStyle = {
            strokeWidth: 2,
            stroke: strokeColor,
            strokeDasharray: "4, 2",
            fillOpacity: '0',
        };

        return <rect
                x={rect.left}
                y={rect.top}
                width={rect.right - rect.left}
                height={rect.bottom - rect.top}
                style={rectStyle} />
    },
    mapHorizontalKey: function(rect, horizontal) {
        switch (horizontal) {
            case 'left':
                return rect.left;
            case 'right':
                return rect.right;
            case 'half':
                return (rect.left + rect.right) / 2;
            default:
                return -1;
        }
    },
    mapVerticalKey: function(rect, vertical) {
        switch (vertical) {
            case 'top':
                return rect.top;
            case 'bottom':
                return rect.bottom;
            case 'half':
                return (rect.top + rect.bottom) / 2;
            default:
                return -1;
        }
    },
    mapCursorKey: function(vertical, horizontal) {
        switch (vertical + '-' + horizontal) {
            case 'top-left':
                return'nw-resize';
            case 'top-right':
                return'ne-resize';
            case 'top-half':
                return'n-resize';
            case 'half-left':
                return'w-resize';
            case 'half-right':
                return'e-resize';
            case 'bottom-left':
                return'sw-resize';
            case 'bottom-right':
                return'se-resize';
            case 'bottom-half':
                return's-resize';
            default:
                return 'default';
        }

    },
    makeSizingDotDisplayNode: function(rect, fillColor, vertical, horizontal) {
        var dotSize = 6;
        var x = this.mapHorizontalKey(rect, horizontal) - dotSize / 2;
        var y = this.mapVerticalKey(rect, vertical) - dotSize / 2;
        var rectStyle = {
            fill: fillColor,
        };

        return <rect
                x={x}
                y={y}
                width={dotSize}
                height={dotSize}
                style={rectStyle} />;
    },
    makeSizingDotControlNode: function(rect, vertical, horizontal) {
        var controlSize = 12;
        var cursor = this.mapCursorKey(vertical, horizontal);
        var x = this.mapHorizontalKey(rect, horizontal) - controlSize / 2;
        var y = this.mapVerticalKey(rect, vertical) - controlSize / 2;

        var rectStyle = {
            cursor: cursor,
            left: x,
            top: y,
            width: controlSize,
            height: controlSize,
        };

        return (
            <div
                    className="ct-text"
                    onMouseDown={this.handleSizingDotControlMouseDown.bind(this, vertical, horizontal)}
                    style={rectStyle}>
            </div>
        );
    },
    mapSizingColor: function(which) {
        switch (which) {
            case 'overlay':
                return '#66b1e4';
            case 'content':
                return '#b9dcf3';
            default:
                return '#000000';
        }

    },
    makeSizingDisplayNode: function(text, which, isFocus) {
        if (!isFocus) {
            return <div></div>;
        }

        var rect = text[which].rect;
        var color = this.mapSizingColor(which);

        return (
            <div className="ct-text" style={{top: '0px', left: '0px', height: '100%'}}>
                <svg style={{width: '100%', height: '100%'}}>
                    {this.makeSizingBorderDisplayNode(rect, color)}
                    {this.makeSizingDotDisplayNode(rect, color, 'top', 'left')}
                    {this.makeSizingDotDisplayNode(rect, color, 'top', 'right')}
                    {this.makeSizingDotDisplayNode(rect, color, 'top', 'half')}
                    {this.makeSizingDotDisplayNode(rect, color, 'half', 'left')}
                    {this.makeSizingDotDisplayNode(rect, color, 'half', 'right')}
                    {this.makeSizingDotDisplayNode(rect, color, 'bottom', 'left')}
                    {this.makeSizingDotDisplayNode(rect, color, 'bottom', 'right')}
                    {this.makeSizingDotDisplayNode(rect, color, 'bottom', 'half')}
                </svg>
            </div>
        );
    },
    makeSizingControlNode: function(text, which, isFocus) {
        if (!isFocus) {
            return <div></div>;
        }

        var rect = text[which].rect;

        return (
            <div className="ct-text" style={{top: '0px', left: '0px', height: '100%'}}>
                <div>
                    {this.makeSizingDotControlNode(rect, 'top', 'left')}
                    {this.makeSizingDotControlNode(rect, 'top', 'right')}
                    {this.makeSizingDotControlNode(rect, 'top', 'half')}
                    {this.makeSizingDotControlNode(rect, 'half', 'left')}
                    {this.makeSizingDotControlNode(rect, 'half', 'right')}
                    {this.makeSizingDotControlNode(rect, 'bottom', 'left')}
                    {this.makeSizingDotControlNode(rect, 'bottom', 'right')}
                    {this.makeSizingDotControlNode(rect, 'bottom', 'half')}
                </div>
            </div>
        );
    },
    makeOverlayDisplayMainNode: function(text, imageUrl) {
        var overlay = text.overlay;

        switch (overlay.texture) {
            case 'blur':
                return (
                    <div className="ct-text ct-blur-overlay" style={this.makeBlurOverlayStyle(text)}>
                        <img src={imageUrl}></img>
                    </div>
                );
            case 'block':
                return (
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
                );
            default:
                return <div></div>;
        }
    },
    makeContentDisplayMainNode: function(text) {
        return (
            <div className="ct-text" style={this.makeContentStyle(text)}>
                {text.content.words}
            </div>
        );
    },
    makeOverlayDisplayNode: function(text, isFocus, imageUrl) {
        return (
            <div>
                {this.makeOverlayDisplayMainNode(text, imageUrl)}
                {this.makeSizingDisplayNode(text, 'overlay', isFocus)}
            </div>
        );
    },
    makeContentDisplayNode: function(text, isFocus) {
        return (
            <div>
                {this.makeContentDisplayMainNode(text)}
                {this.makeSizingDisplayNode(text, 'content', isFocus)}
            </div>
        );
    },
    makeOverlayControlNode: function(text, isFocus, imageUrl) {
        return (
            <div>
                {this.makeSizingControlNode(text, 'overlay', isFocus)}
            </div>
        );
    },
    makeContentControlNode: function(text, isFocus, imageUrl) {
        return (
            <div>
                {this.makeSizingControlNode(text, 'content', isFocus)}
            </div>
        );
    },
    makeTitleInputNode: function() {
        return (
            <div>
                <input type="text" className="form-control input-lg"
                        value={this.state.translation.title}
                        onChange={this.handleTitleChange} />
            </div>
        );
    },
    makeImageNode: function() {
        var me = this;
        var imageUrl = this.state.translation.original.imageUrl;

        var textDisplayNodes = this.state.translation.texts.map(function(text, idx) {
            var isFocus = (idx == me.state.focusTextIdx);

            return (
                <div key={idx}>
                    {me.makeOverlayDisplayNode(text, isFocus, imageUrl)}
                    {me.makeContentDisplayNode(text, isFocus)}
                </div>
            );
        });

        var textControlNodes = this.state.translation.texts.map(function(text, idx) {
            var isFocus = (idx == me.state.focusTextIdx);

            return (
                <div key={idx}>
                    {me.makeOverlayControlNode(text, isFocus)}
                    {me.makeContentControlNode(text, isFocus)}
                </div>
            );
        });

        return (
            <div className="ct-image">
                <img src={imageUrl}></img>
                {textDisplayNodes}
                {textControlNodes}
            </div>
        );
    },
    createLeftPanel: function() {
        return (
            <div>
                {this.makeTitleInputNode()}
                {this.makeImageNode()}
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
            sizingStatus: null,
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
            <div
                    onMouseUp={this.handleSizingDotControlMouseUp}
                    onMouseMove={this.handleSizingDotControlMouseMove}>
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

