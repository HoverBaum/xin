![Xin logo](/docs/logo.png)

A Framework. Not sure where this is headed just yet.

Check out the [docs/api.md](/docs/api.md) for more infos.

THIS IS IN ALPHA AND UNSTABLE BUT FEEL FREE TO FIND ISSUES.

Features:
- Events
- modules

Planned:
- Databinding
- Templating
- Events for backend

## Usage

XIN provides two global functions as well as a global 'XIN' object.

### Events

To handle events XIN provides `emit()` and `subscribe()`. The philosophy is that `emit()` will broadcast something to a `channel`. You can hand `emit()` as many arguments as you want. `subscribe()` can be used to listen on a specific channel. Just hand it a callback. `subscribe()` also returns an object which you can use to listen to only specific events. Events are specified by the second argument to an `emit()` call.

```javascript
//Subscribe to all messages on the 'test' channel.
subscribe('test', function(msg){
    console.log(msg);
});

//Subscribe only to the 'deep' events on the 'test' channel.
subscribe('test').on('deep', function(msg) {
    console.log(`deepEvent: ${msg}`);
})

//This will only be processed by the first listener.
emit('test', 'Hallo Test');

//This will be processed by both bot differently.
emit('test', 'deep', 'Deep event');
```

### Modules

XIN supports the use of [AMD modules](https://github.com/amdjs/amdjs-api/wiki/AMD) which means that you `define` modules.  
Modules are identified by their path. So if you have a file at `/modules/module.js` it's identifier would be `modules/module`.

```javascript
define(['dependencies'], function(dep) {
    return module;
});
```

To define a module you need to call `define()` with a least an array and a function. All strings in the array will be loaded as dependencies and handed to the function. Whatever gets returned by the function will be handed to modules depending on it.

#### Requires

You can also require defined module.

```javascript
require('some/module', function(mod) {

});
```
