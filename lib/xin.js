'use strict';

function setupXin() {

    //TODO implement consumers that only get called once upon an event.

    var theGlobal = (typeof global !== "undefined") ? global : window;

    //Stores arrays of listeners for channels.
    const channels = new Map();

    //Stores maps of arrays of listerns for events on channels.
    const channelEvents = new Map();

    //Stores consumer that only want to be called once.
    const consumers = new Map();

    /**
     *   @typedef {object} OnSubscriber
     *   @property {function} on - Subscribe to a special event on this channel.
     *   @property {function} consume - Subscribe to only the next occurance of an event.
     */

    /**
     *   Subscribe to a channel.
     *
     *   @param  {string}   channel    - Channel identifier
     *   @param  {function} [callback] - Function call upon event.
     *   @return {OnSubscriber} Enable subscript to events on this channel.
     *   @alias subscribe
     *   @global
     */
    theGlobal.subscribe = function(channel, callback) {

        //Check if channel already exists.
        if (!channels.has(channel)) {
            channels.set(channel, []);
            channelEvents.set(channel, new Map());
            consumers.set(channel, new Map());
            emit('xin', 'newChannel', channel);
        }

        //Save the new callback.
        channels.get(channel).push(callback);

        //Enable .on chaining.
        return createChainObject(channel);
    };

    /**
     *   Emit something over a channel.
     *
     *   @param  {string} channel - Channel identifier.
     *   @param  {string} [event] - Event identifier.
     *   @param  {...any} extras  - Any extra parammeters to emit.
     *   @alias emit
     *   @global
     */
    theGlobal.emit = function(channel, event) {

        //Check if there is anyone listening.
        if (!channels.has(channel)) {
            return false;
        }

        //Send the message, that is to say all extra arguments.
        let allArgs = Array.prototype.slice.call(arguments, 1);
        channels.get(channel).forEach(subscription => {
            subscription(...allArgs);
        });

        //Check if this is an event people are listening for.
        let eventArgs = Array.prototype.slice.call(arguments, 2);
        if (channelEvents.get(channel).has(event)) {
            channelEvents.get(channel).get(event).forEach(listener => {
                listener(...eventArgs);
            });
        }

        //Check for consumers.
        if (consumers.get(channel).has(event)) {
            consumers.get(channel).get(event).forEach((listener, index) => {
                listener(...eventArgs);
                consumers.get(channel).get(event).slice(index, 1);
            });
        }

    };

    /**
     *   Registers a consumer which will only be called once.
     *
     *   @param  {string}   channel  Channel on which to subscribe.
     *   @param  {string}   event    Even which to subscribe to.
     *   @param  {Function} listener Listener for event.
     *   @return {OnSubscriber}      Enable subscript to events on this channel.
     *   @private
     */
    function registerConsumer(channel, event, listener) {

        //Store the listener
        let store = consumers.get(channel);
        if (!store.has(event)) {
            store.set(event, []);
        }
        store.get(event).push(listener);

        //Enable chaining.
        return createChainObject(channel);
    }

    /**
     *   Adds a listener for a specific event on a channel.
     *
     *   @param  {string}   channel  Channel on which to subscribe.
     *   @param  {string}   event    Even which to subscribe to.
     *   @param  {Function} listener Listener for event.
     *   @return {OnSubscriber}      Enable subscript to events on this channel.
     *   @private
     */
    function subscribeEvent(channel, event, listener) {

        //Store the listener
        let store = channelEvents.get(channel);
        if (!store.has(event)) {
            store.set(event, []);
        }
        store.get(event).push(listener);

        //Enable chaining.
        return createChainObject(channel);
    }

    /**
     *   Creates an object for method chaining on subscriptions.
     *   @param  {string} channel The channel this chains on.
     *   @return {OnSubscriber}
     *   @private
     */
    function createChainObject(channel) {
        return {
            on: function(event, listener) {
                subscribeEvent(channel, event, listener);
            },
            consume: function(event, listener) {
                registerConsumer(channel, event, listener);
            }
        }
    }

    theGlobal.XIN = {
        on: subscribe,
        subscribe: subscribe,
        emit: emit,
        publish: emit
    }

}
setupXin();
