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
            me.state.translation = translation;
            me.setState(me.state);
        }, 'json');
    },
    isTextFocused: function(textIdx, textWhich) {
        if (!this.state.focusText) {
            return false;
        }
        if (this.state.focusText.index != textIdx) {
            return false;
        }
        if (textWhich == undefined) { // don't care which
            return true;
        }
        return (this.state.focusText.which == textWhich);
    },
    getTextTemplate: function() {
        if (this.state.focusText) {
            return this.state.translation.texts[this.state.focusText.index];
        }
        if (this.state.translation.texts.length > 0) {
            return this.state.translation.texts[0];
        }
        return {
            content: {
                words: '',
                fontSize: 16,
                textColor: 'white',
                textShadowColor: 'black',
                rect: {
                    top: 0,
                    left: 0,
                    bottom: 100,
                    right: 100,
                },
            },
            overlay: {
                texture: 'block',
                fillColor: 'white',
                rect: {
                    top: 0,
                    left: 0,
                    bottom: 100,
                    right: 100,
                },
            },
        };
    },
    getFocusedRect: function() {
        if (!this.state.focusText) {
            return null;
        }

        var textIdx = this.state.focusText.index;
        var textWhich = this.state.focusText.which;

        return this.state.translation.texts[textIdx][textWhich].rect;
    },
    calculateOffsetLeft: function(element) {
        var offsetLeft = 0;

        do {
            offsetLeft += element.offsetLeft;
        } while(element = element.offsetParent);

        return offsetLeft;
    },
    calculateOffsetTop: function(element) {
        var offsetTop = 0;

        do {
            offsetTop += element.offsetTop;
        } while(element = element.offsetParent);

        return offsetTop;
    },
    handleTitleChange: function(evt) {
        var state = this.state;
        state.translation.title = evt.target.value;
        this.setState(state);
    },
    handleTextInputFocus: function(idx, evt) {
        this.state.focusText = {
            index: idx,
            which: 'overlay',
        };
        this.setState(this.state);
    },
    handleWordsChange: function(idx, evt) {
        var text = this.state.translation.texts[idx];
        text.content.words = evt.target.value;
        this.setState(this.state);
    },
    handleOverlayTextureChange: function(evt) {
        var idx = this.state.focusText.index;
        var text = this.state.translation.texts[idx];
        text.overlay.texture = evt.target.value;
        this.setState(this.state);
    },
    handleFillColorChange: function(evt) {
        var idx = this.state.focusText.index;
        var text = this.state.translation.texts[idx];
        text.overlay.fillColor = evt.target.value;
        this.setState(this.state);
    },
    handleTextColorChange: function(evt) {
        var idx = this.state.focusText.index;
        var text = this.state.translation.texts[idx];
        text.content.textColor = evt.target.value;
        this.setState(this.state);
    },
    handleTextShadowColorChange: function(evt) {
        var idx = this.state.focusText.index;
        var text = this.state.translation.texts[idx];
        text.content.textShadowColor = evt.target.value;
        this.setState(this.state);
    },
    handleFontSizeChange: function(evt) {
        var idx = this.state.focusText.index;
        var text = this.state.translation.texts[idx];
        text.content.fontSize = evt.target.value;
        this.setState(this.state);
    },
    handleSizingDotControlMouseDown: function(vertical, horizontal, evt) {
        this.state.rectModifyStatus = {
            mode: 'resize',
            vertical: vertical,
            horizontal: horizontal,
        };
        this.setState(this.state);
    },
    handleRectModifyMouseUp: function(evt) {
        if (!this.state.rectModifyStatus) {
            return;
        }

        this.state.rectModifyStatus = null;
        this.setState(this.state);
    },
    handleGrabSquareClick: function(textIdx, textWhich, evt) {
        this.state.focusText = {
            index: textIdx,
            which: textWhich,
        };
        this.setState(this.state);
    },
    handleGrabSquareMouseDown: function(textIdx, textWhich, evt) {
        this.state.focusText = {
            index: textIdx,
            which: textWhich,
        };

        var coor = this.calculateMouseCoordinate(evt);
        var rect = this.getFocusedRect();

        this.state.rectModifyStatus = {
            mode: 'move',
            grabX: coor.x - rect.left,
            grabY: coor.y - rect.top,
        };

        this.setState(this.state);
    },
    calculateMouseCoordinate: function(evt) {
        var image = document.getElementById('ct-image-container');
        var mouseX = evt.clientX + window.pageXOffset;
        var mouseY = evt.clientY + window.pageYOffset;
        var offsetX = this.calculateOffsetLeft(image);
        var offsetY = this.calculateOffsetTop(image);
        var relativeX = mouseX - offsetX;
        var relativeY = mouseY - offsetY;

        return {
            x: relativeX,
            y: relativeY,
        };
    },
    handleRectResize: function(evt) {
        var rect = this.getFocusedRect();
        var vertical = this.state.rectModifyStatus.vertical;
        var horizontal = this.state.rectModifyStatus.horizontal;
        var coor = this.calculateMouseCoordinate(evt);

        switch (vertical) {
            case 'top':
            case 'bottom':
                rect[vertical] = coor.y;
                break;
            case 'half':
            default:
                break;
        }

        switch (horizontal) {
            case 'left':
            case 'right':
                rect[horizontal] = coor.x;
                break;
            case 'half':
            default:
                break;
        }
    },
    handleRectMove: function(evt) {
        var coor = this.calculateMouseCoordinate(evt);
        var rect = this.getFocusedRect();

        var width = rect.right - rect.left;
        var height = rect.bottom - rect.top;

        rect.left = coor.x - this.state.rectModifyStatus.grabX;
        rect.top = coor.y - this.state.rectModifyStatus.grabY;
        rect.right = rect.left + width;
        rect.bottom = rect.top + height;

        this.setState(this.state);
    },
    handleRectModifyMouseMove: function(evt) {
        if (!this.state.rectModifyStatus) {
            return;
        }

        switch (this.state.rectModifyStatus.mode) {
            case 'resize':
                this.handleRectResize(evt);
                break;
            case 'move':
                this.handleRectMove(evt);
                break;
            default:
                break;
        }

        this.setState(this.state);
    },
    handleDeleteTextButtonClick: function(evt) {
        this.state.translation.texts.splice(this.state.focusText.index, 1);
        this.state.focusText = null;
        this.setState(this.state);
    },
    handleAddTextButtonClick: function(evt) {
        var textTemplate = this.getTextTemplate();

        this.state.translation.texts.push({
            content: {
                words: '一行新的',
                fontSize: textTemplate.content.fontSize,
                textColor: textTemplate.content.textColor,
                textShadowColor: textTemplate.content.textShadowColor,
                rect: {
                    top: 30,
                    left: 30,
                    bottom: 80,
                    right: 180,
                },
            },
            overlay: {
                texture: textTemplate.overlay.texture,
                fillColor: textTemplate.overlay.fillColor,
                rect: {
                    top: 10,
                    left: 10,
                    bottom: 100,
                    right: 200,
                },
            },
        });

        this.state.focusText = {
            index: this.state.translation.texts.length - 1,
            which: 'overlay',
        };

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
    makeGrabSquareNode: function(text, which, isFocus, textIdx) {
        var rect = text[which].rect;

        var rectStyle = {
            cursor: 'pointer',
            left: rect.left,
            top: rect.top,
            width: rect.right - rect.left,
            height: rect.bottom - rect.top,
        };

        return (
            <div className="ct-text" style={{top: '0px', left: '0px', height: '100%'}}>
                <div
                        className="ct-text"
                        onClick={this.handleGrabSquareClick.bind(this, textIdx, which)}
                        onMouseDown={this.handleGrabSquareMouseDown.bind(this, textIdx, which)}
                        style={rectStyle}>
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
            <div className="ct-text ct-no-select" style={this.makeContentStyle(text)}>
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
    makeOverlayControlNode: function(text, isFocus, textIdx) {
        return (
            <div>
                {this.makeGrabSquareNode(text, 'overlay', isFocus, textIdx)}
                {this.makeSizingControlNode(text, 'overlay', isFocus)}
            </div>
        );
    },
    makeContentControlNode: function(text, isFocus, textIdx) {
        return (
            <div>
                {this.makeGrabSquareNode(text, 'content', isFocus, textIdx)}
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
            return (
                <div key={idx}>
                    {me.makeOverlayDisplayNode(text, me.isTextFocused(idx, 'overlay'), imageUrl)}
                    {me.makeContentDisplayNode(text, me.isTextFocused(idx, 'content'))}
                </div>
            );
        });

        var textControlNodes = this.state.translation.texts.map(function(text, idx) {
            return (
                <div key={idx}>
                    {me.makeOverlayControlNode(text, me.isTextFocused(idx, 'overlay'), idx)}
                    {me.makeContentControlNode(text, me.isTextFocused(idx, 'content'), idx)}
                </div>
            );
        });

        return (
            <div id="ct-image-container" className="ct-image">
                <img className="ct-no-select" src={imageUrl}></img>
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
    createTextDetailArea: function() {
        if (!this.state.focusText) {
            return <div></div>;
        }

        var text = this.state.translation.texts[this.state.focusText.index];

        return (
            <div>
                <p>
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

                </p>

                <p>
                    <button className="btn btn-danger" onClick={this.handleDeleteTextButtonClick}>把這行刪掉</button>
                </p>
            </div>
        );
    },
    createAddTextButton: function() {
        return (
            <div>
                <p>
                    <button className="btn btn-primary" onClick={this.handleAddTextButtonClick}>加一行新的</button>
                </p>
                <hr></hr>
            </div>
        );
    },
    createTextInputList: function() {
        var me = this;

        return this.state.translation.texts.map(function(text, idx) {
            return (
                <div key={idx}>
                    <textarea className="form-control"
                            value={text.content.words}
                            style={{background: me.isTextFocused(idx) ? '#dbedf9' : 'white'}}
                            onFocus={me.handleTextInputFocus.bind(me, idx)}
                            onChange={me.handleWordsChange.bind(me, idx)} />
                    <hr></hr>
                </div>
            );
        });
    },
    createRightPanel: function() {
        var addTextButton = this.createAddTextButton();
        var textInputList = this.createTextInputList();
        var textEditArea = this.createTextDetailArea();

        return (
            <div>
                {addTextButton}
                {textInputList}
                {textEditArea}
            </div>
        );
    },
    getInitialState: function() {
        return {
            translation: null,
            focusText: null,
            rectModifyStatus: null,
        };
    },
    componentDidMount: function() {
        this.loadTranslationFromServer();
    },
    render: function() {
        if (!this.state.translation) {
            return <div><center><h3>載入中…</h3></center></div>;
        }

        return (
            <div
                    onMouseUp={this.handleRectModifyMouseUp}
                    onMouseMove={this.handleRectModifyMouseMove}>
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

