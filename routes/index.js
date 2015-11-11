var express = require('express'),
    router = express.Router();
var zmq = require('zmq'),
    requester = zmq.socket('req');
var fs = require('fs'),
    path = require('path');

requester.connect('tcp://localhost:5543');

io.on('connection', function(socket){
    console.log('client connected.');
    socket.once('disconnect', function(){
        console.log('client disconnected');
        socket.disconnect();
    });

    var files = fs.readdirSync(path.join(__dirname,'../public/img')).map(function(file){
        return 'img/' + file;
    });
    io.to(socket.id).emit('load',files);

});

requester.on('message', function(msg){
  var data = JSON.parse(msg);
  console.log('got a response: ' + msg);
  io.emit('gifconverted',data);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Youtube Gif Creator' });
});

router.post('/', function(req,res,next){
  console.log(req.body);
  requester.send(JSON.stringify(req.body));
  res.redirect('/');
});
module.exports = router;
