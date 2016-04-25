module.exports = function(server) {

    requirejs.config({
        nodeRequire: require,
        baseUrl: './'
    });

    requirejs(['xin'],
        function() {

            emit('xin', 'use', 'ubiquitous');

            subscribe('test', function(args) {
                console.log(args);
            });

        });

}
