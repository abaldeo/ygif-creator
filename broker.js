var zmq = require('zmq'),
    frontend = zmq.socket('router'),
    backend = zmq.socket('dealer');

frontend.bindSync('tcp://*:5543');
backend.bindSync('tcp://*:5569');

//send message from frontend to backend
frontend.on('message', function(){
    var args = Array.apply(null, arguments);
    backend.send(args);
});

//send message from backend to frontend
backend.on('message', function(){
    var args = Array.apply(null, arguments);
    frontend.send(args);
});
