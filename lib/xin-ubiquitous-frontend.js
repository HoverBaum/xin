define(["io, xin"], function setupUbiquitousFrontend(io) {
    var socket = io('/xin');
    socket.on('xin', function(msg) {
        console.log(msg);
    })

    subscribe('xin').on('newChannel', function(newChannelName) {
        socket.on(newChannelName, function(args) {
            console.log(`frontend on [${newChannelName}] got:`);
            console.log(args);
            emit(newChannelName, ...args);
        });
        subscribe(newChannelName, function() {
            console.log('Should be emitting on socket ' + newChannelName);
            socket.emit(newChannelName, arguments);
        });
        socket.emit('newChannel', newChannelName);
    });
});
