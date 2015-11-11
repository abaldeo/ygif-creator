var zmq = require('zmq'),
    cluster = require('cluster'),
    numCPUs = require('os').cpus().length;
var fs = require('fs'),
    qs = require('querystring'),
    path = require('path'),
    ytdl = require('ytdl-core'),
    gifify = require('gifify');

if (cluster.isMaster){
    for(var i=0;i<numCPUs;i++){
        cluster.fork();
    }

    cluster.on('online', function(worker){
        console.log('worker ' + worker.id + ' is online');
    })
}
else if (cluster.isWorker){
    var responder = zmq.socket('rep');
    responder.connect('tcp://localhost:5569');

    responder.on('message', function(msg){
        console.log('worker ' + cluster.worker.id + ' received request with ' + msg);
        var data = JSON.parse(msg);
        var urlQuery = data.videoURL.substring(data.videoURL.indexOf('?')+1);
        var video_id = qs.parse(urlQuery).v;
        var gif_name = video_id + '.gif';
        var gif_path = path.join(__dirname, gif_name);
        console.log(gif_name, gif_path);
        //var vid = fs.createWriteStream(path.join(__dirname,'test.mp4'));

        var videoStream = ytdl(data.videoURL, {quality:136,filter:'video'});

        var gif = fs.createWriteStream(gif_path);

        var options = {
            compress:5,
            colors:160,
            fps: 24,
            resize: '-1:400',
            from: data.startTime,
            to: data.duration
        };
        gifify(videoStream, options).pipe(gif);

        //videoStream.pipe(vid);

        //vid.on('finish', function(){
        //    console.log('finished downloading youtube video...starting conversion to gif.');
        //    var options = {
        //        compress:5,
        //        colors:160,
        //        fps: 24,
        //        resize: '-1:400',
        //        from: 52,
        //        to: 1
        //    };
        //    gifify(path.join(__dirname,'test.mp4'),options).pipe(gif);
        //});

        gif.on('finish', function() {
            console.log('finished converting to gif...');
            fs.renameSync(gif_path,path.join(__dirname,'public/img',gif_name));
            responder.send(JSON.stringify({
                imagePath: 'img/'+gif_name
            }));
        });
    });

    cluster.worker.on('exit', function(code, signal){
        if (signal){
            console.log('closing connection to broker');
            responder.close();
        }
    });
}
