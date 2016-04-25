define(function() {

    if(typeof global !== "undefined") {
        return global;
    } else {
        return window;
    }

});
