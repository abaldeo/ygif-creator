var React = require('react');
var ReactDOM = require('react-dom');
var io = require('socket.io-client');

var GifGallery = React.createClass({
    getInitialState(){
        return {
            gifs:[]
        }
    },
    componentWillMount(){
        this.socket = io();
        this.socket.on('connect',this.connect);
        this.socket.on('load',this.setup);
        this.socket.on('disconnect',this.disconnect);
        this.socket.on('gifconverted',this.update);
    },
    connect(){
        console.log('connected to server.');
    },
    disconnect(){
        console.log('disconnected from server');
    },
    setup(data){
        this.setState({gifs:data});
    },
    update(data){
        console.log('received new gif ' + data.imagePath);
        this.setState({gifs:this.state.gifs.concat([data.imagePath])})
    },
    render() {
        var gallery = [];
        for(var i=0;i<this.state.gifs.length;i++){
            console.log('loading img ' + this.state.gifs[i]);
            gallery.push(<GifImage imgPath={this.state.gifs[i]}/>);
        }
        return <div className="row">{gallery}</div>;
    }
});

var GifImage = React.createClass({
    render(){
        return (<div className="col-lg-3 col-md-4 col-xs-6">
                    <img className="img-responsive" src={this.props.imgPath}/>
                </div>);
    }
});

ReactDOM.render(<GifGallery/>, document.getElementById('gif-gallery'));