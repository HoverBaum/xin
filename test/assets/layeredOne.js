//To test nesting of module dependencies.
define(['assets/layeredTwo', 'assets/layeredThree'], function(two, three) {

    return {
        number: two.number,
        three: three.number
    }
});
