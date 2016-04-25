
// Require.js allows us to configure shortcut alias
require.config({
    baseUrl: '/lib',
  // The shim config allows us to configure dependencies for
  // scripts that do not call define() to register a module
  shim: {
    'socket.io': {
      exports: 'io'
    }
  },
  paths: {
    socketio: '/socket.io/socket.io'
  }
});

requirejs(["xin", "xin/ubiquitous"], function() {

    subscribe('test', function(msg) {
        console.log(msg)
    }).on('deepTest', function(msg) {
        console.log('deepMsg: ' + msg);
    });

    window.test = function() {
        emit('test', 'hallo welt');
        emit('test', 'deepTest', 'Hallo deep');
    }

});
