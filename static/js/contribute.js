var Fresh = React.createClass({
    render: function() {
        var me = this;

        return (
            <div>
                <div><h2>{this.props.fresh.title}</h2></div>
                <div className="ct-image">
                    <img src={this.props.fresh.imageUrl}></img>
                </div>
                <div>
                    <form action="/translate" method="post">
                        <input type="hidden" name="url" value={this.props.fresh.pageUrl} />
                        <div className="btn-group" role="group">
                            <a className="btn btn-default" href={this.props.fresh.pageUrl} target="_blank">出處</a>
                            <input type="submit" className="btn btn-default" value="翻譯" />
                        </div>
                    </form>
                </div>
                <hr></hr>
            </div>
        );
    }
});

var FreshList = React.createClass({
    loadFresh: function() {
        var me = this;
        $.get('/api/fresh/list', function(freshs) {
            me.state.freshs = freshs;
            me.setState(me.state);
        }, 'json');
    },
    getInitialState: function() {
        return {
            freshs: null,
        };
    },
    componentDidMount: function() {
        this.loadFresh();
    },
    render: function() {
        var freshs = this.state.freshs;

        if (!freshs) {
            return <div></div>;
        }

        var freshNodes = freshs.map(function(fresh) {
            return (
                <div className="col-md-6 col-md-offset-3">
                    <Fresh fresh={fresh} key={fresh.pageUrl}>
                    </Fresh>
                </div>
            );
        });

        return (
            <div>
                {freshNodes}
            </div>
        );
    }
});

ReactDOM.render(
    <FreshList />,
    document.getElementById('fresh')
);

