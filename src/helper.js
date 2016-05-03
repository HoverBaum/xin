/**
 *   Helper for XIN.
 */

XIN.forEach = function forEach(array, callback, scope) {
    for (let i = 0; i < array.length; i++) {
        callback.call(scope, array[i], i);
    }
}

XIN.get = function httpGet(url) {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState === 4 && request.status === 200) {
                    resolve(request.responseText);
                }
            }
            request.onerror = function () {
                reject(new Error(this.statusText));
            }
            request.open('GET', url);
            request.send();
        });
    }
