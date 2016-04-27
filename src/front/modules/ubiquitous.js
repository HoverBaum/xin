define(["socket.io"], function setupUbiquitousFrontend(io) {
    var socket = io('/xin');

    socket.on('xin', function(msg) {
        handleMessage('xin', msg);
    });

    //Subscribe to creation of new channels.
    subscribe('xin').on('newChannel', function(newChannelName) {

        //Handle messages from other end to this channel.
        socket.on(newChannelName, function(msg) {
            handleMessage(newChannelName, msg);
        });

        //Make sure to pass all further events on this channel along.
        subscribe(newChannelName, function() {

            //Only emit if not originally from other.
            if(!this.XIN_SOCKET_ORIGIN) {
                socket.emit(newChannelName, arguments);
            }
        });

        //Let the other end know about this channel.
        socket.emit('newChannel', newChannelName);
    });

    function handleMessage(channel, msg) {
        console.log(`Message on [${channel}] got: ${msg}`);
        var args = createArgsArray(msg);
        args[0] = channel;

        //Emit event with arguments.
        var that = this;
        this.XIN_SOCKET_ORIGIN = true;
        emit.apply(that, args);
    }

    /**
     *   Parses arguments object into an array.
     *   @param  {object} msg   The message object with arguments.
     *   @return {array}        The arguments as an array. First field empty
     *                          to put the channel into.
     */
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
});
