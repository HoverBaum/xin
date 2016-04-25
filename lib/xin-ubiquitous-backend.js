module.exports = function(io) {

    var nsp = io.of('/xin');

    nsp.on('connection', function(socket) {

        socket.on('newChannel', function(message) {
            var that = this;
            this.xinSocketEmit = true;
            socket.on(message, function(msg) {
                console.log(`backend on [${message}] got:`);
                console.log(msg);
                var args = createArgsArray(msg);
                args[0] = message;
                emit.apply(that, args);
            });
            subscribe(message, function() {
                if(!this.xinSocketEmit) {
                    socket.emit(message, arguments);
                }
            });
        });
    });
}

function createArgsArray(msg) {
    var arr = [];
    for(key in msg) {
        if(!isNaN(key)) {
            var pos = parseInt(key) + 1;
            arr[pos] = msg[key];
        }
    }
    return arr;
}
