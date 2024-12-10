!function(e) {
    "object" == typeof exports ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : "undefined" != typeof window ? window.iframePhone = e() : "undefined" != typeof global ? global.iframePhone = e() : "undefined" != typeof self && (self.iframePhone = e());
}(function() {
    var define1, module1, exports1;
    return (function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    throw new Error("Cannot find module '" + o + "'");
                }
                var f = n[o] = {
                    exports: {}
                };
                t[o][0].call(f.exports, function(e) {
                    var n = t[o][1][e];
                    return s(n ? n : e);
                }, f, f.exports, e, t, n, r);
            }
            return n[o].exports;
        }
        var i = typeof require == "function" && require;
        for(var o = 0; o < r.length; o++)s(r[o]);
        return s;
    })({
        1: [
            function(require1, module1, exports1) {
                var structuredClone = require1('./structured-clone');
                var HELLO_INTERVAL_LENGTH = 200;
                var HELLO_TIMEOUT_LENGTH = 1000;
                function IFrameEndpoint() {
                    var parentOrigin;
                    var listeners = {};
                    var isInitialized = false;
                    var connected = false;
                    var postMessageQueue = [];
                    var helloInterval;
                    function postToTarget(message, target) {
                        // See http://dev.opera.com/articles/view/window-postmessage-messagechannel/#crossdoc
                        //     https://github.com/Modernizr/Modernizr/issues/388
                        //     http://jsfiddle.net/ryanseddon/uZTgD/2/
                        if (structuredClone.supported()) {
                            window.parent.postMessage(message, target);
                        } else {
                            window.parent.postMessage(JSON.stringify(message), target);
                        }
                    }
                    function post(type, content) {
                        var message;
                        // Message object can be constructed from 'type' and 'content' arguments or it can be passed
                        // as the first argument.
                        if (arguments.length === 1 && typeof type === 'object' && typeof type.type === 'string') {
                            message = type;
                        } else {
                            message = {
                                type: type,
                                content: content
                            };
                        }
                        if (connected) {
                            postToTarget(message, parentOrigin);
                        } else {
                            postMessageQueue.push(message);
                        }
                    }
                    // Only the initial 'hello' message goes permissively to a '*' target (because due to cross origin
                    // restrictions we can't find out our parent's origin until they voluntarily send us a message
                    // with it.)
                    function postHello() {
                        postToTarget({
                            type: 'hello',
                            origin: document.location.href.match(/(.*?\/\/.*?)\//)[1]
                        }, '*');
                    }
                    function addListener(type, fn) {
                        listeners[type] = fn;
                    }
                    function removeAllListeners() {
                        listeners = {};
                    }
                    function getListenerNames() {
                        return Object.keys(listeners);
                    }
                    function messageListener(message) {
                        // Anyone can send us a message. Only pay attention to messages from parent.
                        if (message.source !== window.parent) return;
                        var messageData = message.data;
                        if (typeof messageData === 'string') messageData = JSON.parse(messageData);
                        // We don't know origin property of parent window until it tells us.
                        if (!connected && messageData.type === 'hello') {
                            // This is the return handshake from the embedding window.
                            parentOrigin = messageData.origin;
                            connected = true;
                            stopPostingHello();
                            while(postMessageQueue.length > 0){
                                post(postMessageQueue.shift());
                            }
                        }
                        // Perhaps-redundantly insist on checking origin as well as source window of message.
                        if (message.origin === parentOrigin) {
                            if (listeners[messageData.type]) listeners[messageData.type](messageData.content);
                        }
                    }
                    function disconnect() {
                        connected = false;
                        stopPostingHello();
                        window.removeEventListener('message', messsageListener);
                    }
                    /**
     Initialize communication with the parent frame. This should not be called until the app's custom
     listeners are registered (via our 'addListener' public method) because, once we open the
     communication, the parent window may send any messages it may have queued. Messages for which
     we don't have handlers will be silently ignored.
     */ function initialize() {
                        if (isInitialized) {
                            return;
                        }
                        isInitialized = true;
                        if (window.parent === window) return;
                        // We kick off communication with the parent window by sending a "hello" message. Then we wait
                        // for a handshake (another "hello" message) from the parent window.
                        postHello();
                        startPostingHello();
                        window.addEventListener('message', messageListener, false);
                    }
                    function startPostingHello() {
                        if (helloInterval) {
                            stopPostingHello();
                        }
                        helloInterval = window.setInterval(postHello, HELLO_INTERVAL_LENGTH);
                        window.setTimeout(stopPostingHello, HELLO_TIMEOUT_LENGTH);
                    }
                    function stopPostingHello() {
                        window.clearInterval(helloInterval);
                        helloInterval = null;
                    }
                    // Public API.
                    return {
                        initialize: initialize,
                        getListenerNames: getListenerNames,
                        addListener: addListener,
                        removeAllListeners: removeAllListeners,
                        disconnect: disconnect,
                        post: post
                    };
                }
                var instance = null;
                // IFrameEndpoint is a singleton, as iframe can't have multiple parents anyway.
                module1.exports = function getIFrameEndpoint() {
                    if (!instance) {
                        instance = new IFrameEndpoint();
                    }
                    return instance;
                };
            },
            {
                "./structured-clone": 4
            }
        ],
        2: [
            function(require1, module1, exports1) {
                "use strict";
                var ParentEndpoint = require1('./parent-endpoint');
                var getIFrameEndpoint = require1('./iframe-endpoint');
                // Not a real UUID as there's an RFC for that (needed for proper distributed computing).
                // But in this fairly parochial situation, we just need to be fairly sure to avoid repeats.
                function getPseudoUUID() {
                    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
                    var len = chars.length;
                    var ret = [];
                    for(var i = 0; i < 10; i++){
                        ret.push(chars[Math.floor(Math.random() * len)]);
                    }
                    return ret.join('');
                }
                module1.exports = function IframePhoneRpcEndpoint(handler, namespace, targetWindow, targetOrigin) {
                    var phone;
                    var pendingCallbacks = Object.create({});
                    if (targetWindow === window.parent) {
                        phone = getIFrameEndpoint();
                        phone.initialize();
                    } else {
                        phone = new ParentEndpoint(targetWindow, targetOrigin);
                    }
                    phone.addListener(namespace, function(message) {
                        var callbackObj;
                        if (message.messageType === 'call') {
                            handler(message.value, function(returnValue) {
                                phone.post(namespace, {
                                    messageType: 'returnValue',
                                    uuid: message.uuid,
                                    value: returnValue
                                });
                            });
                        } else if (message.messageType === 'returnValue') {
                            callbackObj = pendingCallbacks[message.uuid];
                            if (callbackObj) {
                                window.clearTimeout(callbackObj.timeout);
                                if (callbackObj.callback) {
                                    callbackObj.callback.call(undefined, message.value);
                                }
                                pendingCallbacks[message.uuid] = null;
                            }
                        }
                    });
                    function call(message, callback) {
                        var uuid = getPseudoUUID();
                        pendingCallbacks[uuid] = {
                            callback: callback,
                            timeout: window.setTimeout(function() {
                                if (callback) {
                                    callback(undefined, new Error("IframePhone timed out waiting for reply"));
                                }
                            }, 2000)
                        };
                        phone.post(namespace, {
                            messageType: 'call',
                            uuid: uuid,
                            value: message
                        });
                    }
                    function disconnect() {
                        phone.disconnect();
                    }
                    return {
                        call: call,
                        disconnect: disconnect
                    };
                };
            },
            {
                "./iframe-endpoint": 1,
                "./parent-endpoint": 3
            }
        ],
        3: [
            function(require1, module1, exports1) {
                var structuredClone = require1('./structured-clone');
                /**
   Call as:
   new ParentEndpoint(targetWindow, targetOrigin, afterConnectedCallback)
   targetWindow is a WindowProxy object. (Messages will be sent to it)

   targetOrigin is the origin of the targetWindow. (Messages will be restricted to this origin)

   afterConnectedCallback is an optional callback function to be called when the connection is
   established.

   OR (less secure):
   new ParentEndpoint(targetIframe, afterConnectedCallback)

   targetIframe is a DOM object (HTMLIframeElement); messages will be sent to its contentWindow.

   afterConnectedCallback is an optional callback function

   In this latter case, targetOrigin will be inferred from the value of the src attribute of the
   provided DOM object at the time of the constructor invocation. This is less secure because the
   iframe might have been navigated to an unexpected domain before constructor invocation.

   Note that it is important to specify the expected origin of the iframe's content to safeguard
   against sending messages to an unexpected domain. This might happen if our iframe is navigated to
   a third-party URL unexpectedly. Furthermore, having a reference to Window object (as in the first
   form of the constructor) does not protect against sending a message to the wrong domain. The
   window object is actualy a WindowProxy which transparently proxies the Window object of the
   underlying iframe, so that when the iframe is navigated, the "same" WindowProxy now references a
   completely differeent Window object, possibly controlled by a hostile domain.

   See http://www.esdiscuss.org/topic/a-dom-use-case-that-can-t-be-emulated-with-direct-proxies for
   more about this weird behavior of WindowProxies (the type returned by <iframe>.contentWindow).
   */ module1.exports = function ParentEndpoint(targetWindowOrIframeEl, targetOrigin, afterConnectedCallback) {
                    var selfOrigin = window.location.href.match(/(.*?\/\/.*?)\//)[1];
                    var postMessageQueue = [];
                    var connected = false;
                    var handlers = {};
                    var targetWindowIsIframeElement;
                    function getOrigin(iframe) {
                        return iframe.src.match(/(.*?\/\/.*?)\//)[1];
                    }
                    function post(type, content) {
                        var message;
                        // Message object can be constructed from 'type' and 'content' arguments or it can be passed
                        // as the first argument.
                        if (arguments.length === 1 && typeof type === 'object' && typeof type.type === 'string') {
                            message = type;
                        } else {
                            message = {
                                type: type,
                                content: content
                            };
                        }
                        if (connected) {
                            var tWindow = getTargetWindow();
                            // if we are laready connected ... send the message
                            message.origin = selfOrigin;
                            // See http://dev.opera.com/articles/view/window-postmessage-messagechannel/#crossdoc
                            //     https://github.com/Modernizr/Modernizr/issues/388
                            //     http://jsfiddle.net/ryanseddon/uZTgD/2/
                            if (structuredClone.supported()) {
                                tWindow.postMessage(message, targetOrigin);
                            } else {
                                tWindow.postMessage(JSON.stringify(message), targetOrigin);
                            }
                        } else {
                            // else queue up the messages to send after connection complete.
                            postMessageQueue.push(message);
                        }
                    }
                    function addListener(messageName, func) {
                        handlers[messageName] = func;
                    }
                    function removeListener(messageName) {
                        handlers[messageName] = null;
                    }
                    // Note that this function can't be used when IFrame element hasn't been added to DOM yet
                    // (.contentWindow would be null). At the moment risk is purely theoretical, as the parent endpoint
                    // only listens for an incoming 'hello' message and the first time we call this function
                    // is in #receiveMessage handler (so iframe had to be initialized before, as it could send 'hello').
                    // It would become important when we decide to refactor the way how communication is initialized.
                    function getTargetWindow() {
                        if (targetWindowIsIframeElement) {
                            var tWindow = targetWindowOrIframeEl.contentWindow;
                            if (!tWindow) {
                                throw "IFrame element needs to be added to DOM before communication " + "can be started (.contentWindow is not available)";
                            }
                            return tWindow;
                        }
                        return targetWindowOrIframeEl;
                    }
                    function receiveMessage(message) {
                        var messageData;
                        if (message.source === getTargetWindow() && message.origin === targetOrigin) {
                            messageData = message.data;
                            if (typeof messageData === 'string') {
                                messageData = JSON.parse(messageData);
                            }
                            if (handlers[messageData.type]) {
                                handlers[messageData.type](messageData.content);
                            } else {
                                console.log("cant handle type: " + messageData.type);
                            }
                        }
                    }
                    function disconnect() {
                        connected = false;
                        window.removeEventListener('message', receiveMessage);
                    }
                    // handle the case that targetWindowOrIframeEl is actually an <iframe> rather than a Window(Proxy) object
                    // Note that if it *is* a WindowProxy, this probe will throw a SecurityException, but in that case
                    // we also don't need to do anything
                    try {
                        targetWindowIsIframeElement = targetWindowOrIframeEl.constructor === HTMLIFrameElement;
                    } catch (e) {
                        targetWindowIsIframeElement = false;
                    }
                    if (targetWindowIsIframeElement) {
                        // Infer the origin ONLY if the user did not supply an explicit origin, i.e., if the second
                        // argument is empty or is actually a callback (meaning it is supposed to be the
                        // afterConnectionCallback)
                        if (!targetOrigin || targetOrigin.constructor === Function) {
                            afterConnectedCallback = targetOrigin;
                            targetOrigin = getOrigin(targetWindowOrIframeEl);
                        }
                    }
                    // when we receive 'hello':
                    addListener('hello', function() {
                        connected = true;
                        // send hello response
                        post('hello');
                        // give the user a chance to do things now that we are connected
                        // note that is will happen before any queued messages
                        if (afterConnectedCallback && typeof afterConnectedCallback === "function") {
                            afterConnectedCallback();
                        }
                        // Now send any messages that have been queued up ...
                        while(postMessageQueue.length > 0){
                            post(postMessageQueue.shift());
                        }
                    });
                    window.addEventListener('message', receiveMessage, false);
                    // Public API.
                    return {
                        post: post,
                        addListener: addListener,
                        removeListener: removeListener,
                        disconnect: disconnect
                    };
                };
            },
            {
                "./structured-clone": 4
            }
        ],
        4: [
            function(require1, module1, exports1) {
                var featureSupported = false;
                (function() {
                    var result = 0;
                    if (!!window.postMessage) {
                        try {
                            // Safari 5.1 will sometimes throw an exception and sometimes won't, lolwut?
                            // When it doesn't we capture the message event and check the
                            // internal [[Class]] property of the message being passed through.
                            // Safari will pass through DOM nodes as Null iOS safari on the other hand
                            // passes it through as DOMWindow, gotcha.
                            window.onmessage = function(e) {
                                var type = Object.prototype.toString.call(e.data);
                                result = type.indexOf("Null") != -1 || type.indexOf("DOMWindow") != -1 ? 1 : 0;
                                featureSupported = {
                                    'structuredClones': result
                                };
                            };
                            // Spec states you can't transmit DOM nodes and it will throw an error
                            // postMessage implimentations that support cloned data will throw.
                            window.postMessage(document.createElement("a"), "*");
                        } catch (e) {
                            // BBOS6 throws but doesn't pass through the correct exception
                            // so check error message
                            result = e.DATA_CLONE_ERR || e.message == "Cannot post cyclic structures." ? 1 : 0;
                            featureSupported = {
                                'structuredClones': result
                            };
                        }
                    }
                })();
                exports1.supported = function supported() {
                    return featureSupported && featureSupported.structuredClones > 0;
                };
            },
            {}
        ],
        5: [
            function(require1, module1, exports1) {
                module1.exports = {
                    /**
     * Allows to communicate with an iframe.
     */ ParentEndpoint: require1('./lib/parent-endpoint'),
                    /**
     * Allows to communicate with a parent page.
     * IFrameEndpoint is a singleton, as iframe can't have multiple parents anyway.
     */ getIFrameEndpoint: require1('./lib/iframe-endpoint'),
                    structuredClone: require1('./lib/structured-clone'),
                    // TODO: May be misnamed
                    IframePhoneRpcEndpoint: require1('./lib/iframe-phone-rpc-endpoint')
                };
            },
            {
                "./lib/iframe-endpoint": 1,
                "./lib/iframe-phone-rpc-endpoint": 2,
                "./lib/parent-endpoint": 3,
                "./lib/structured-clone": 4
            }
        ]
    }, {}, [
        5
    ])(5);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvaWZyYW1lLXBob25lLTEuMS4zLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiFmdW5jdGlvbihlKXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShlKTpcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P3dpbmRvdy5pZnJhbWVQaG9uZT1lKCk6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbD9nbG9iYWwuaWZyYW1lUGhvbmU9ZSgpOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBzZWxmJiYoc2VsZi5pZnJhbWVQaG9uZT1lKCkpfShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbiAgdmFyIHN0cnVjdHVyZWRDbG9uZSA9IHJlcXVpcmUoJy4vc3RydWN0dXJlZC1jbG9uZScpO1xuICB2YXIgSEVMTE9fSU5URVJWQUxfTEVOR1RIID0gMjAwO1xuICB2YXIgSEVMTE9fVElNRU9VVF9MRU5HVEggPSAxMDAwO1xuXG4gIGZ1bmN0aW9uIElGcmFtZUVuZHBvaW50KCkge1xuICAgIHZhciBwYXJlbnRPcmlnaW47XG4gICAgdmFyIGxpc3RlbmVycyA9IHt9O1xuICAgIHZhciBpc0luaXRpYWxpemVkID0gZmFsc2U7XG4gICAgdmFyIGNvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHZhciBwb3N0TWVzc2FnZVF1ZXVlID0gW107XG4gICAgdmFyIGhlbGxvSW50ZXJ2YWw7XG5cbiAgICBmdW5jdGlvbiBwb3N0VG9UYXJnZXQobWVzc2FnZSwgdGFyZ2V0KSB7XG4gICAgICAvLyBTZWUgaHR0cDovL2Rldi5vcGVyYS5jb20vYXJ0aWNsZXMvdmlldy93aW5kb3ctcG9zdG1lc3NhZ2UtbWVzc2FnZWNoYW5uZWwvI2Nyb3NzZG9jXG4gICAgICAvLyAgICAgaHR0cHM6Ly9naXRodWIuY29tL01vZGVybml6ci9Nb2Rlcm5penIvaXNzdWVzLzM4OFxuICAgICAgLy8gICAgIGh0dHA6Ly9qc2ZpZGRsZS5uZXQvcnlhbnNlZGRvbi91WlRnRC8yL1xuICAgICAgaWYgKHN0cnVjdHVyZWRDbG9uZS5zdXBwb3J0ZWQoKSkge1xuICAgICAgICB3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKG1lc3NhZ2UsIHRhcmdldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpLCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBvc3QodHlwZSwgY29udGVudCkge1xuICAgICAgdmFyIG1lc3NhZ2U7XG4gICAgICAvLyBNZXNzYWdlIG9iamVjdCBjYW4gYmUgY29uc3RydWN0ZWQgZnJvbSAndHlwZScgYW5kICdjb250ZW50JyBhcmd1bWVudHMgb3IgaXQgY2FuIGJlIHBhc3NlZFxuICAgICAgLy8gYXMgdGhlIGZpcnN0IGFyZ3VtZW50LlxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgdHlwZW9mIHR5cGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiB0eXBlLnR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIG1lc3NhZ2UgPSB0eXBlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVzc2FnZSA9IHtcbiAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChjb25uZWN0ZWQpIHtcbiAgICAgICAgcG9zdFRvVGFyZ2V0KG1lc3NhZ2UsIHBhcmVudE9yaWdpbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwb3N0TWVzc2FnZVF1ZXVlLnB1c2gobWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gT25seSB0aGUgaW5pdGlhbCAnaGVsbG8nIG1lc3NhZ2UgZ29lcyBwZXJtaXNzaXZlbHkgdG8gYSAnKicgdGFyZ2V0IChiZWNhdXNlIGR1ZSB0byBjcm9zcyBvcmlnaW5cbiAgICAvLyByZXN0cmljdGlvbnMgd2UgY2FuJ3QgZmluZCBvdXQgb3VyIHBhcmVudCdzIG9yaWdpbiB1bnRpbCB0aGV5IHZvbHVudGFyaWx5IHNlbmQgdXMgYSBtZXNzYWdlXG4gICAgLy8gd2l0aCBpdC4pXG4gICAgZnVuY3Rpb24gcG9zdEhlbGxvKCkge1xuICAgICAgcG9zdFRvVGFyZ2V0KHtcbiAgICAgICAgdHlwZTogJ2hlbGxvJyxcbiAgICAgICAgb3JpZ2luOiBkb2N1bWVudC5sb2NhdGlvbi5ocmVmLm1hdGNoKC8oLio/XFwvXFwvLio/KVxcLy8pWzFdXG4gICAgICB9LCAnKicpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZExpc3RlbmVyKHR5cGUsIGZuKSB7XG4gICAgICBsaXN0ZW5lcnNbdHlwZV0gPSBmbjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoKSB7XG4gICAgICBsaXN0ZW5lcnMgPSB7fTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRMaXN0ZW5lck5hbWVzKCkge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGxpc3RlbmVycyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWVzc2FnZUxpc3RlbmVyKG1lc3NhZ2UpIHtcbiAgICAgIC8vIEFueW9uZSBjYW4gc2VuZCB1cyBhIG1lc3NhZ2UuIE9ubHkgcGF5IGF0dGVudGlvbiB0byBtZXNzYWdlcyBmcm9tIHBhcmVudC5cbiAgICAgIGlmIChtZXNzYWdlLnNvdXJjZSAhPT0gd2luZG93LnBhcmVudCkgcmV0dXJuO1xuXG4gICAgICB2YXIgbWVzc2FnZURhdGEgPSBtZXNzYWdlLmRhdGE7XG5cbiAgICAgIGlmICh0eXBlb2YgbWVzc2FnZURhdGEgPT09ICdzdHJpbmcnKSBtZXNzYWdlRGF0YSA9IEpTT04ucGFyc2UobWVzc2FnZURhdGEpO1xuXG4gICAgICAvLyBXZSBkb24ndCBrbm93IG9yaWdpbiBwcm9wZXJ0eSBvZiBwYXJlbnQgd2luZG93IHVudGlsIGl0IHRlbGxzIHVzLlxuICAgICAgaWYgKCFjb25uZWN0ZWQgJiYgbWVzc2FnZURhdGEudHlwZSA9PT0gJ2hlbGxvJykge1xuICAgICAgICAvLyBUaGlzIGlzIHRoZSByZXR1cm4gaGFuZHNoYWtlIGZyb20gdGhlIGVtYmVkZGluZyB3aW5kb3cuXG4gICAgICAgIHBhcmVudE9yaWdpbiA9IG1lc3NhZ2VEYXRhLm9yaWdpbjtcbiAgICAgICAgY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgICAgc3RvcFBvc3RpbmdIZWxsbygpO1xuICAgICAgICB3aGlsZShwb3N0TWVzc2FnZVF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBwb3N0KHBvc3RNZXNzYWdlUXVldWUuc2hpZnQoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUGVyaGFwcy1yZWR1bmRhbnRseSBpbnNpc3Qgb24gY2hlY2tpbmcgb3JpZ2luIGFzIHdlbGwgYXMgc291cmNlIHdpbmRvdyBvZiBtZXNzYWdlLlxuICAgICAgaWYgKG1lc3NhZ2Uub3JpZ2luID09PSBwYXJlbnRPcmlnaW4pIHtcbiAgICAgICAgaWYgKGxpc3RlbmVyc1ttZXNzYWdlRGF0YS50eXBlXSkgbGlzdGVuZXJzW21lc3NhZ2VEYXRhLnR5cGVdKG1lc3NhZ2VEYXRhLmNvbnRlbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRpc2Nvbm5lY3QoKSB7XG4gICAgICBjb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgIHN0b3BQb3N0aW5nSGVsbG8oKTtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbWVzc3NhZ2VMaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgIEluaXRpYWxpemUgY29tbXVuaWNhdGlvbiB3aXRoIHRoZSBwYXJlbnQgZnJhbWUuIFRoaXMgc2hvdWxkIG5vdCBiZSBjYWxsZWQgdW50aWwgdGhlIGFwcCdzIGN1c3RvbVxuICAgICBsaXN0ZW5lcnMgYXJlIHJlZ2lzdGVyZWQgKHZpYSBvdXIgJ2FkZExpc3RlbmVyJyBwdWJsaWMgbWV0aG9kKSBiZWNhdXNlLCBvbmNlIHdlIG9wZW4gdGhlXG4gICAgIGNvbW11bmljYXRpb24sIHRoZSBwYXJlbnQgd2luZG93IG1heSBzZW5kIGFueSBtZXNzYWdlcyBpdCBtYXkgaGF2ZSBxdWV1ZWQuIE1lc3NhZ2VzIGZvciB3aGljaFxuICAgICB3ZSBkb24ndCBoYXZlIGhhbmRsZXJzIHdpbGwgYmUgc2lsZW50bHkgaWdub3JlZC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaXNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICBpZiAod2luZG93LnBhcmVudCA9PT0gd2luZG93KSByZXR1cm47XG5cbiAgICAgIC8vIFdlIGtpY2sgb2ZmIGNvbW11bmljYXRpb24gd2l0aCB0aGUgcGFyZW50IHdpbmRvdyBieSBzZW5kaW5nIGEgXCJoZWxsb1wiIG1lc3NhZ2UuIFRoZW4gd2Ugd2FpdFxuICAgICAgLy8gZm9yIGEgaGFuZHNoYWtlIChhbm90aGVyIFwiaGVsbG9cIiBtZXNzYWdlKSBmcm9tIHRoZSBwYXJlbnQgd2luZG93LlxuICAgICAgcG9zdEhlbGxvKCk7XG4gICAgICBzdGFydFBvc3RpbmdIZWxsbygpO1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBtZXNzYWdlTGlzdGVuZXIsIGZhbHNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdGFydFBvc3RpbmdIZWxsbygpIHtcbiAgICAgIGlmIChoZWxsb0ludGVydmFsKSB7XG4gICAgICAgIHN0b3BQb3N0aW5nSGVsbG8oKTtcbiAgICAgIH1cbiAgICAgIGhlbGxvSW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwocG9zdEhlbGxvLCBIRUxMT19JTlRFUlZBTF9MRU5HVEgpO1xuICAgICAgd2luZG93LnNldFRpbWVvdXQoc3RvcFBvc3RpbmdIZWxsbywgSEVMTE9fVElNRU9VVF9MRU5HVEgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0b3BQb3N0aW5nSGVsbG8oKSB7XG4gICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChoZWxsb0ludGVydmFsKTtcbiAgICAgIGhlbGxvSW50ZXJ2YWwgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFB1YmxpYyBBUEkuXG4gICAgcmV0dXJuIHtcbiAgICAgIGluaXRpYWxpemUgICAgICAgIDogaW5pdGlhbGl6ZSxcbiAgICAgIGdldExpc3RlbmVyTmFtZXMgIDogZ2V0TGlzdGVuZXJOYW1lcyxcbiAgICAgIGFkZExpc3RlbmVyICAgICAgIDogYWRkTGlzdGVuZXIsXG4gICAgICByZW1vdmVBbGxMaXN0ZW5lcnM6IHJlbW92ZUFsbExpc3RlbmVycyxcbiAgICAgIGRpc2Nvbm5lY3QgICAgICAgIDogZGlzY29ubmVjdCxcbiAgICAgIHBvc3QgICAgICAgICAgICAgIDogcG9zdFxuICAgIH07XG4gIH1cblxuICB2YXIgaW5zdGFuY2UgPSBudWxsO1xuXG4vLyBJRnJhbWVFbmRwb2ludCBpcyBhIHNpbmdsZXRvbiwgYXMgaWZyYW1lIGNhbid0IGhhdmUgbXVsdGlwbGUgcGFyZW50cyBhbnl3YXkuXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0SUZyYW1lRW5kcG9pbnQoKSB7XG4gICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgaW5zdGFuY2UgPSBuZXcgSUZyYW1lRW5kcG9pbnQoKTtcbiAgICB9XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9O1xufSx7XCIuL3N0cnVjdHVyZWQtY2xvbmVcIjo0fV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBQYXJlbnRFbmRwb2ludCA9IHJlcXVpcmUoJy4vcGFyZW50LWVuZHBvaW50Jyk7XG4gIHZhciBnZXRJRnJhbWVFbmRwb2ludCA9IHJlcXVpcmUoJy4vaWZyYW1lLWVuZHBvaW50Jyk7XG5cbi8vIE5vdCBhIHJlYWwgVVVJRCBhcyB0aGVyZSdzIGFuIFJGQyBmb3IgdGhhdCAobmVlZGVkIGZvciBwcm9wZXIgZGlzdHJpYnV0ZWQgY29tcHV0aW5nKS5cbi8vIEJ1dCBpbiB0aGlzIGZhaXJseSBwYXJvY2hpYWwgc2l0dWF0aW9uLCB3ZSBqdXN0IG5lZWQgdG8gYmUgZmFpcmx5IHN1cmUgdG8gYXZvaWQgcmVwZWF0cy5cbiAgZnVuY3Rpb24gZ2V0UHNldWRvVVVJRCgpIHtcbiAgICB2YXIgY2hhcnMgPSAnYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5JztcbiAgICB2YXIgbGVuID0gY2hhcnMubGVuZ3RoO1xuICAgIHZhciByZXQgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgcmV0LnB1c2goY2hhcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGVuKV0pO1xuICAgIH1cbiAgICByZXR1cm4gcmV0LmpvaW4oJycpO1xuICB9XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBJZnJhbWVQaG9uZVJwY0VuZHBvaW50KGhhbmRsZXIsIG5hbWVzcGFjZSwgdGFyZ2V0V2luZG93LCB0YXJnZXRPcmlnaW4pIHtcbiAgICB2YXIgcGhvbmU7XG4gICAgdmFyIHBlbmRpbmdDYWxsYmFja3MgPSBPYmplY3QuY3JlYXRlKHt9KTtcblxuICAgIGlmICh0YXJnZXRXaW5kb3cgPT09IHdpbmRvdy5wYXJlbnQpIHtcbiAgICAgIHBob25lID0gZ2V0SUZyYW1lRW5kcG9pbnQoKTtcbiAgICAgIHBob25lLmluaXRpYWxpemUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGhvbmUgPSBuZXcgUGFyZW50RW5kcG9pbnQodGFyZ2V0V2luZG93LCB0YXJnZXRPcmlnaW4pO1xuICAgIH1cblxuICAgIHBob25lLmFkZExpc3RlbmVyKG5hbWVzcGFjZSwgZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgdmFyIGNhbGxiYWNrT2JqO1xuXG4gICAgICBpZiAobWVzc2FnZS5tZXNzYWdlVHlwZSA9PT0gJ2NhbGwnKSB7XG4gICAgICAgIGhhbmRsZXIobWVzc2FnZS52YWx1ZSwgZnVuY3Rpb24ocmV0dXJuVmFsdWUpIHtcbiAgICAgICAgICBwaG9uZS5wb3N0KG5hbWVzcGFjZSwge1xuICAgICAgICAgICAgbWVzc2FnZVR5cGU6ICdyZXR1cm5WYWx1ZScsXG4gICAgICAgICAgICB1dWlkOiBtZXNzYWdlLnV1aWQsXG4gICAgICAgICAgICB2YWx1ZTogcmV0dXJuVmFsdWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKG1lc3NhZ2UubWVzc2FnZVR5cGUgPT09ICdyZXR1cm5WYWx1ZScpIHtcbiAgICAgICAgY2FsbGJhY2tPYmogPSBwZW5kaW5nQ2FsbGJhY2tzW21lc3NhZ2UudXVpZF07XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrT2JqKSB7XG4gICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dChjYWxsYmFja09iai50aW1lb3V0KTtcbiAgICAgICAgICBpZiAoY2FsbGJhY2tPYmouY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrT2JqLmNhbGxiYWNrLmNhbGwodW5kZWZpbmVkLCBtZXNzYWdlLnZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGVuZGluZ0NhbGxiYWNrc1ttZXNzYWdlLnV1aWRdID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gY2FsbChtZXNzYWdlLCBjYWxsYmFjaykge1xuICAgICAgdmFyIHV1aWQgPSBnZXRQc2V1ZG9VVUlEKCk7XG5cbiAgICAgIHBlbmRpbmdDYWxsYmFja3NbdXVpZF0gPSB7XG4gICAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayxcbiAgICAgICAgdGltZW91dDogd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayh1bmRlZmluZWQsIG5ldyBFcnJvcihcIklmcmFtZVBob25lIHRpbWVkIG91dCB3YWl0aW5nIGZvciByZXBseVwiKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAyMDAwKVxuICAgICAgfTtcblxuICAgICAgcGhvbmUucG9zdChuYW1lc3BhY2UsIHtcbiAgICAgICAgbWVzc2FnZVR5cGU6ICdjYWxsJyxcbiAgICAgICAgdXVpZDogdXVpZCxcbiAgICAgICAgdmFsdWU6IG1lc3NhZ2VcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRpc2Nvbm5lY3QoKSB7XG4gICAgICBwaG9uZS5kaXNjb25uZWN0KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNhbGw6IGNhbGwsXG4gICAgICBkaXNjb25uZWN0OiBkaXNjb25uZWN0XG4gICAgfTtcbiAgfTtcblxufSx7XCIuL2lmcmFtZS1lbmRwb2ludFwiOjEsXCIuL3BhcmVudC1lbmRwb2ludFwiOjN9XSwzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbiAgdmFyIHN0cnVjdHVyZWRDbG9uZSA9IHJlcXVpcmUoJy4vc3RydWN0dXJlZC1jbG9uZScpO1xuXG4gIC8qKlxuICAgQ2FsbCBhczpcbiAgIG5ldyBQYXJlbnRFbmRwb2ludCh0YXJnZXRXaW5kb3csIHRhcmdldE9yaWdpbiwgYWZ0ZXJDb25uZWN0ZWRDYWxsYmFjaylcbiAgIHRhcmdldFdpbmRvdyBpcyBhIFdpbmRvd1Byb3h5IG9iamVjdC4gKE1lc3NhZ2VzIHdpbGwgYmUgc2VudCB0byBpdClcblxuICAgdGFyZ2V0T3JpZ2luIGlzIHRoZSBvcmlnaW4gb2YgdGhlIHRhcmdldFdpbmRvdy4gKE1lc3NhZ2VzIHdpbGwgYmUgcmVzdHJpY3RlZCB0byB0aGlzIG9yaWdpbilcblxuICAgYWZ0ZXJDb25uZWN0ZWRDYWxsYmFjayBpcyBhbiBvcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgY29ubmVjdGlvbiBpc1xuICAgZXN0YWJsaXNoZWQuXG5cbiAgIE9SIChsZXNzIHNlY3VyZSk6XG4gICBuZXcgUGFyZW50RW5kcG9pbnQodGFyZ2V0SWZyYW1lLCBhZnRlckNvbm5lY3RlZENhbGxiYWNrKVxuXG4gICB0YXJnZXRJZnJhbWUgaXMgYSBET00gb2JqZWN0IChIVE1MSWZyYW1lRWxlbWVudCk7IG1lc3NhZ2VzIHdpbGwgYmUgc2VudCB0byBpdHMgY29udGVudFdpbmRvdy5cblxuICAgYWZ0ZXJDb25uZWN0ZWRDYWxsYmFjayBpcyBhbiBvcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvblxuXG4gICBJbiB0aGlzIGxhdHRlciBjYXNlLCB0YXJnZXRPcmlnaW4gd2lsbCBiZSBpbmZlcnJlZCBmcm9tIHRoZSB2YWx1ZSBvZiB0aGUgc3JjIGF0dHJpYnV0ZSBvZiB0aGVcbiAgIHByb3ZpZGVkIERPTSBvYmplY3QgYXQgdGhlIHRpbWUgb2YgdGhlIGNvbnN0cnVjdG9yIGludm9jYXRpb24uIFRoaXMgaXMgbGVzcyBzZWN1cmUgYmVjYXVzZSB0aGVcbiAgIGlmcmFtZSBtaWdodCBoYXZlIGJlZW4gbmF2aWdhdGVkIHRvIGFuIHVuZXhwZWN0ZWQgZG9tYWluIGJlZm9yZSBjb25zdHJ1Y3RvciBpbnZvY2F0aW9uLlxuXG4gICBOb3RlIHRoYXQgaXQgaXMgaW1wb3J0YW50IHRvIHNwZWNpZnkgdGhlIGV4cGVjdGVkIG9yaWdpbiBvZiB0aGUgaWZyYW1lJ3MgY29udGVudCB0byBzYWZlZ3VhcmRcbiAgIGFnYWluc3Qgc2VuZGluZyBtZXNzYWdlcyB0byBhbiB1bmV4cGVjdGVkIGRvbWFpbi4gVGhpcyBtaWdodCBoYXBwZW4gaWYgb3VyIGlmcmFtZSBpcyBuYXZpZ2F0ZWQgdG9cbiAgIGEgdGhpcmQtcGFydHkgVVJMIHVuZXhwZWN0ZWRseS4gRnVydGhlcm1vcmUsIGhhdmluZyBhIHJlZmVyZW5jZSB0byBXaW5kb3cgb2JqZWN0IChhcyBpbiB0aGUgZmlyc3RcbiAgIGZvcm0gb2YgdGhlIGNvbnN0cnVjdG9yKSBkb2VzIG5vdCBwcm90ZWN0IGFnYWluc3Qgc2VuZGluZyBhIG1lc3NhZ2UgdG8gdGhlIHdyb25nIGRvbWFpbi4gVGhlXG4gICB3aW5kb3cgb2JqZWN0IGlzIGFjdHVhbHkgYSBXaW5kb3dQcm94eSB3aGljaCB0cmFuc3BhcmVudGx5IHByb3hpZXMgdGhlIFdpbmRvdyBvYmplY3Qgb2YgdGhlXG4gICB1bmRlcmx5aW5nIGlmcmFtZSwgc28gdGhhdCB3aGVuIHRoZSBpZnJhbWUgaXMgbmF2aWdhdGVkLCB0aGUgXCJzYW1lXCIgV2luZG93UHJveHkgbm93IHJlZmVyZW5jZXMgYVxuICAgY29tcGxldGVseSBkaWZmZXJlZW50IFdpbmRvdyBvYmplY3QsIHBvc3NpYmx5IGNvbnRyb2xsZWQgYnkgYSBob3N0aWxlIGRvbWFpbi5cblxuICAgU2VlIGh0dHA6Ly93d3cuZXNkaXNjdXNzLm9yZy90b3BpYy9hLWRvbS11c2UtY2FzZS10aGF0LWNhbi10LWJlLWVtdWxhdGVkLXdpdGgtZGlyZWN0LXByb3hpZXMgZm9yXG4gICBtb3JlIGFib3V0IHRoaXMgd2VpcmQgYmVoYXZpb3Igb2YgV2luZG93UHJveGllcyAodGhlIHR5cGUgcmV0dXJuZWQgYnkgPGlmcmFtZT4uY29udGVudFdpbmRvdykuXG4gICAqL1xuXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUGFyZW50RW5kcG9pbnQodGFyZ2V0V2luZG93T3JJZnJhbWVFbCwgdGFyZ2V0T3JpZ2luLCBhZnRlckNvbm5lY3RlZENhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGZPcmlnaW4gPSB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCgvKC4qP1xcL1xcLy4qPylcXC8vKVsxXTtcbiAgICB2YXIgcG9zdE1lc3NhZ2VRdWV1ZSA9IFtdO1xuICAgIHZhciBjb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB2YXIgaGFuZGxlcnMgPSB7fTtcbiAgICB2YXIgdGFyZ2V0V2luZG93SXNJZnJhbWVFbGVtZW50O1xuXG4gICAgZnVuY3Rpb24gZ2V0T3JpZ2luKGlmcmFtZSkge1xuICAgICAgcmV0dXJuIGlmcmFtZS5zcmMubWF0Y2goLyguKj9cXC9cXC8uKj8pXFwvLylbMV07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcG9zdCh0eXBlLCBjb250ZW50KSB7XG4gICAgICB2YXIgbWVzc2FnZTtcbiAgICAgIC8vIE1lc3NhZ2Ugb2JqZWN0IGNhbiBiZSBjb25zdHJ1Y3RlZCBmcm9tICd0eXBlJyBhbmQgJ2NvbnRlbnQnIGFyZ3VtZW50cyBvciBpdCBjYW4gYmUgcGFzc2VkXG4gICAgICAvLyBhcyB0aGUgZmlyc3QgYXJndW1lbnQuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiB0eXBlb2YgdHlwZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHR5cGUudHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgbWVzc2FnZSA9IHR5cGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtZXNzYWdlID0ge1xuICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgY29udGVudDogY29udGVudFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKGNvbm5lY3RlZCkge1xuICAgICAgICB2YXIgdFdpbmRvdyA9IGdldFRhcmdldFdpbmRvdygpO1xuICAgICAgICAvLyBpZiB3ZSBhcmUgbGFyZWFkeSBjb25uZWN0ZWQgLi4uIHNlbmQgdGhlIG1lc3NhZ2VcbiAgICAgICAgbWVzc2FnZS5vcmlnaW4gPSBzZWxmT3JpZ2luO1xuICAgICAgICAvLyBTZWUgaHR0cDovL2Rldi5vcGVyYS5jb20vYXJ0aWNsZXMvdmlldy93aW5kb3ctcG9zdG1lc3NhZ2UtbWVzc2FnZWNoYW5uZWwvI2Nyb3NzZG9jXG4gICAgICAgIC8vICAgICBodHRwczovL2dpdGh1Yi5jb20vTW9kZXJuaXpyL01vZGVybml6ci9pc3N1ZXMvMzg4XG4gICAgICAgIC8vICAgICBodHRwOi8vanNmaWRkbGUubmV0L3J5YW5zZWRkb24vdVpUZ0QvMi9cbiAgICAgICAgaWYgKHN0cnVjdHVyZWRDbG9uZS5zdXBwb3J0ZWQoKSkge1xuICAgICAgICAgIHRXaW5kb3cucG9zdE1lc3NhZ2UobWVzc2FnZSwgdGFyZ2V0T3JpZ2luKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0V2luZG93LnBvc3RNZXNzYWdlKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpLCB0YXJnZXRPcmlnaW4pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBlbHNlIHF1ZXVlIHVwIHRoZSBtZXNzYWdlcyB0byBzZW5kIGFmdGVyIGNvbm5lY3Rpb24gY29tcGxldGUuXG4gICAgICAgIHBvc3RNZXNzYWdlUXVldWUucHVzaChtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGRMaXN0ZW5lcihtZXNzYWdlTmFtZSwgZnVuYykge1xuICAgICAgaGFuZGxlcnNbbWVzc2FnZU5hbWVdID0gZnVuYztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihtZXNzYWdlTmFtZSkge1xuICAgICAgaGFuZGxlcnNbbWVzc2FnZU5hbWVdID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBOb3RlIHRoYXQgdGhpcyBmdW5jdGlvbiBjYW4ndCBiZSB1c2VkIHdoZW4gSUZyYW1lIGVsZW1lbnQgaGFzbid0IGJlZW4gYWRkZWQgdG8gRE9NIHlldFxuICAgIC8vICguY29udGVudFdpbmRvdyB3b3VsZCBiZSBudWxsKS4gQXQgdGhlIG1vbWVudCByaXNrIGlzIHB1cmVseSB0aGVvcmV0aWNhbCwgYXMgdGhlIHBhcmVudCBlbmRwb2ludFxuICAgIC8vIG9ubHkgbGlzdGVucyBmb3IgYW4gaW5jb21pbmcgJ2hlbGxvJyBtZXNzYWdlIGFuZCB0aGUgZmlyc3QgdGltZSB3ZSBjYWxsIHRoaXMgZnVuY3Rpb25cbiAgICAvLyBpcyBpbiAjcmVjZWl2ZU1lc3NhZ2UgaGFuZGxlciAoc28gaWZyYW1lIGhhZCB0byBiZSBpbml0aWFsaXplZCBiZWZvcmUsIGFzIGl0IGNvdWxkIHNlbmQgJ2hlbGxvJykuXG4gICAgLy8gSXQgd291bGQgYmVjb21lIGltcG9ydGFudCB3aGVuIHdlIGRlY2lkZSB0byByZWZhY3RvciB0aGUgd2F5IGhvdyBjb21tdW5pY2F0aW9uIGlzIGluaXRpYWxpemVkLlxuICAgIGZ1bmN0aW9uIGdldFRhcmdldFdpbmRvdygpIHtcbiAgICAgIGlmICh0YXJnZXRXaW5kb3dJc0lmcmFtZUVsZW1lbnQpIHtcbiAgICAgICAgdmFyIHRXaW5kb3cgPSB0YXJnZXRXaW5kb3dPcklmcmFtZUVsLmNvbnRlbnRXaW5kb3c7XG4gICAgICAgIGlmICghdFdpbmRvdykge1xuICAgICAgICAgIHRocm93IFwiSUZyYW1lIGVsZW1lbnQgbmVlZHMgdG8gYmUgYWRkZWQgdG8gRE9NIGJlZm9yZSBjb21tdW5pY2F0aW9uIFwiICtcbiAgICAgICAgICAgICAgICBcImNhbiBiZSBzdGFydGVkICguY29udGVudFdpbmRvdyBpcyBub3QgYXZhaWxhYmxlKVwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0V2luZG93O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRhcmdldFdpbmRvd09ySWZyYW1lRWw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVjZWl2ZU1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgdmFyIG1lc3NhZ2VEYXRhO1xuICAgICAgaWYgKG1lc3NhZ2Uuc291cmNlID09PSBnZXRUYXJnZXRXaW5kb3coKSAmJiBtZXNzYWdlLm9yaWdpbiA9PT0gdGFyZ2V0T3JpZ2luKSB7XG4gICAgICAgIG1lc3NhZ2VEYXRhID0gbWVzc2FnZS5kYXRhO1xuICAgICAgICBpZiAodHlwZW9mIG1lc3NhZ2VEYXRhID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIG1lc3NhZ2VEYXRhID0gSlNPTi5wYXJzZShtZXNzYWdlRGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhbmRsZXJzW21lc3NhZ2VEYXRhLnR5cGVdKSB7XG4gICAgICAgICAgaGFuZGxlcnNbbWVzc2FnZURhdGEudHlwZV0obWVzc2FnZURhdGEuY29udGVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJjYW50IGhhbmRsZSB0eXBlOiBcIiArIG1lc3NhZ2VEYXRhLnR5cGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGlzY29ubmVjdCgpIHtcbiAgICAgIGNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCByZWNlaXZlTWVzc2FnZSk7XG4gICAgfVxuXG4gICAgLy8gaGFuZGxlIHRoZSBjYXNlIHRoYXQgdGFyZ2V0V2luZG93T3JJZnJhbWVFbCBpcyBhY3R1YWxseSBhbiA8aWZyYW1lPiByYXRoZXIgdGhhbiBhIFdpbmRvdyhQcm94eSkgb2JqZWN0XG4gICAgLy8gTm90ZSB0aGF0IGlmIGl0ICppcyogYSBXaW5kb3dQcm94eSwgdGhpcyBwcm9iZSB3aWxsIHRocm93IGEgU2VjdXJpdHlFeGNlcHRpb24sIGJ1dCBpbiB0aGF0IGNhc2VcbiAgICAvLyB3ZSBhbHNvIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmdcbiAgICB0cnkge1xuICAgICAgdGFyZ2V0V2luZG93SXNJZnJhbWVFbGVtZW50ID0gdGFyZ2V0V2luZG93T3JJZnJhbWVFbC5jb25zdHJ1Y3RvciA9PT0gSFRNTElGcmFtZUVsZW1lbnQ7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGFyZ2V0V2luZG93SXNJZnJhbWVFbGVtZW50ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHRhcmdldFdpbmRvd0lzSWZyYW1lRWxlbWVudCkge1xuICAgICAgLy8gSW5mZXIgdGhlIG9yaWdpbiBPTkxZIGlmIHRoZSB1c2VyIGRpZCBub3Qgc3VwcGx5IGFuIGV4cGxpY2l0IG9yaWdpbiwgaS5lLiwgaWYgdGhlIHNlY29uZFxuICAgICAgLy8gYXJndW1lbnQgaXMgZW1wdHkgb3IgaXMgYWN0dWFsbHkgYSBjYWxsYmFjayAobWVhbmluZyBpdCBpcyBzdXBwb3NlZCB0byBiZSB0aGVcbiAgICAgIC8vIGFmdGVyQ29ubmVjdGlvbkNhbGxiYWNrKVxuICAgICAgaWYgKCF0YXJnZXRPcmlnaW4gfHwgdGFyZ2V0T3JpZ2luLmNvbnN0cnVjdG9yID09PSBGdW5jdGlvbikge1xuICAgICAgICBhZnRlckNvbm5lY3RlZENhbGxiYWNrID0gdGFyZ2V0T3JpZ2luO1xuICAgICAgICB0YXJnZXRPcmlnaW4gPSBnZXRPcmlnaW4odGFyZ2V0V2luZG93T3JJZnJhbWVFbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gd2hlbiB3ZSByZWNlaXZlICdoZWxsbyc6XG4gICAgYWRkTGlzdGVuZXIoJ2hlbGxvJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25uZWN0ZWQgPSB0cnVlO1xuXG4gICAgICAvLyBzZW5kIGhlbGxvIHJlc3BvbnNlXG4gICAgICBwb3N0KCdoZWxsbycpO1xuXG4gICAgICAvLyBnaXZlIHRoZSB1c2VyIGEgY2hhbmNlIHRvIGRvIHRoaW5ncyBub3cgdGhhdCB3ZSBhcmUgY29ubmVjdGVkXG4gICAgICAvLyBub3RlIHRoYXQgaXMgd2lsbCBoYXBwZW4gYmVmb3JlIGFueSBxdWV1ZWQgbWVzc2FnZXNcbiAgICAgIGlmIChhZnRlckNvbm5lY3RlZENhbGxiYWNrICYmIHR5cGVvZiBhZnRlckNvbm5lY3RlZENhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgYWZ0ZXJDb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgICAgfVxuXG4gICAgICAvLyBOb3cgc2VuZCBhbnkgbWVzc2FnZXMgdGhhdCBoYXZlIGJlZW4gcXVldWVkIHVwIC4uLlxuICAgICAgd2hpbGUocG9zdE1lc3NhZ2VRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHBvc3QocG9zdE1lc3NhZ2VRdWV1ZS5zaGlmdCgpKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgcmVjZWl2ZU1lc3NhZ2UsIGZhbHNlKTtcblxuICAgIC8vIFB1YmxpYyBBUEkuXG4gICAgcmV0dXJuIHtcbiAgICAgIHBvc3Q6IHBvc3QsXG4gICAgICBhZGRMaXN0ZW5lcjogYWRkTGlzdGVuZXIsXG4gICAgICByZW1vdmVMaXN0ZW5lcjogcmVtb3ZlTGlzdGVuZXIsXG4gICAgICBkaXNjb25uZWN0OiBkaXNjb25uZWN0XG4gICAgfTtcbiAgfTtcblxufSx7XCIuL3N0cnVjdHVyZWQtY2xvbmVcIjo0fV0sNDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4gIHZhciBmZWF0dXJlU3VwcG9ydGVkID0gZmFsc2U7XG5cbiAgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzdWx0ID0gMDtcblxuICAgIGlmICghIXdpbmRvdy5wb3N0TWVzc2FnZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gU2FmYXJpIDUuMSB3aWxsIHNvbWV0aW1lcyB0aHJvdyBhbiBleGNlcHRpb24gYW5kIHNvbWV0aW1lcyB3b24ndCwgbG9sd3V0P1xuICAgICAgICAvLyBXaGVuIGl0IGRvZXNuJ3Qgd2UgY2FwdHVyZSB0aGUgbWVzc2FnZSBldmVudCBhbmQgY2hlY2sgdGhlXG4gICAgICAgIC8vIGludGVybmFsIFtbQ2xhc3NdXSBwcm9wZXJ0eSBvZiB0aGUgbWVzc2FnZSBiZWluZyBwYXNzZWQgdGhyb3VnaC5cbiAgICAgICAgLy8gU2FmYXJpIHdpbGwgcGFzcyB0aHJvdWdoIERPTSBub2RlcyBhcyBOdWxsIGlPUyBzYWZhcmkgb24gdGhlIG90aGVyIGhhbmRcbiAgICAgICAgLy8gcGFzc2VzIGl0IHRocm91Z2ggYXMgRE9NV2luZG93LCBnb3RjaGEuXG4gICAgICAgIHdpbmRvdy5vbm1lc3NhZ2UgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgICB2YXIgdHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChlLmRhdGEpO1xuICAgICAgICAgIHJlc3VsdCA9ICh0eXBlLmluZGV4T2YoXCJOdWxsXCIpICE9IC0xIHx8IHR5cGUuaW5kZXhPZihcIkRPTVdpbmRvd1wiKSAhPSAtMSkgPyAxIDogMDtcbiAgICAgICAgICBmZWF0dXJlU3VwcG9ydGVkID0ge1xuICAgICAgICAgICAgJ3N0cnVjdHVyZWRDbG9uZXMnOiByZXN1bHRcbiAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgICAvLyBTcGVjIHN0YXRlcyB5b3UgY2FuJ3QgdHJhbnNtaXQgRE9NIG5vZGVzIGFuZCBpdCB3aWxsIHRocm93IGFuIGVycm9yXG4gICAgICAgIC8vIHBvc3RNZXNzYWdlIGltcGxpbWVudGF0aW9ucyB0aGF0IHN1cHBvcnQgY2xvbmVkIGRhdGEgd2lsbCB0aHJvdy5cbiAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpLFwiKlwiKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAvLyBCQk9TNiB0aHJvd3MgYnV0IGRvZXNuJ3QgcGFzcyB0aHJvdWdoIHRoZSBjb3JyZWN0IGV4Y2VwdGlvblxuICAgICAgICAvLyBzbyBjaGVjayBlcnJvciBtZXNzYWdlXG4gICAgICAgIHJlc3VsdCA9IChlLkRBVEFfQ0xPTkVfRVJSIHx8IGUubWVzc2FnZSA9PSBcIkNhbm5vdCBwb3N0IGN5Y2xpYyBzdHJ1Y3R1cmVzLlwiKSA/IDEgOiAwO1xuICAgICAgICBmZWF0dXJlU3VwcG9ydGVkID0ge1xuICAgICAgICAgICdzdHJ1Y3R1cmVkQ2xvbmVzJzogcmVzdWx0XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICB9KCkpO1xuXG4gIGV4cG9ydHMuc3VwcG9ydGVkID0gZnVuY3Rpb24gc3VwcG9ydGVkKCkge1xuICAgIHJldHVybiBmZWF0dXJlU3VwcG9ydGVkICYmIGZlYXR1cmVTdXBwb3J0ZWQuc3RydWN0dXJlZENsb25lcyA+IDA7XG4gIH07XG5cbn0se31dLDU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBBbGxvd3MgdG8gY29tbXVuaWNhdGUgd2l0aCBhbiBpZnJhbWUuXG4gICAgICovXG4gICAgUGFyZW50RW5kcG9pbnQ6ICByZXF1aXJlKCcuL2xpYi9wYXJlbnQtZW5kcG9pbnQnKSxcbiAgICAvKipcbiAgICAgKiBBbGxvd3MgdG8gY29tbXVuaWNhdGUgd2l0aCBhIHBhcmVudCBwYWdlLlxuICAgICAqIElGcmFtZUVuZHBvaW50IGlzIGEgc2luZ2xldG9uLCBhcyBpZnJhbWUgY2FuJ3QgaGF2ZSBtdWx0aXBsZSBwYXJlbnRzIGFueXdheS5cbiAgICAgKi9cbiAgICBnZXRJRnJhbWVFbmRwb2ludDogcmVxdWlyZSgnLi9saWIvaWZyYW1lLWVuZHBvaW50JyksXG4gICAgc3RydWN0dXJlZENsb25lOiByZXF1aXJlKCcuL2xpYi9zdHJ1Y3R1cmVkLWNsb25lJyksXG5cbiAgICAvLyBUT0RPOiBNYXkgYmUgbWlzbmFtZWRcbiAgICBJZnJhbWVQaG9uZVJwY0VuZHBvaW50OiByZXF1aXJlKCcuL2xpYi9pZnJhbWUtcGhvbmUtcnBjLWVuZHBvaW50JylcblxuICB9O1xuXG59LHtcIi4vbGliL2lmcmFtZS1lbmRwb2ludFwiOjEsXCIuL2xpYi9pZnJhbWUtcGhvbmUtcnBjLWVuZHBvaW50XCI6MixcIi4vbGliL3BhcmVudC1lbmRwb2ludFwiOjMsXCIuL2xpYi9zdHJ1Y3R1cmVkLWNsb25lXCI6NH1dfSx7fSxbNV0pXG4oNSlcbn0pO1xuOyJdLCJuYW1lcyI6WyJlIiwiZXhwb3J0cyIsIm1vZHVsZSIsImRlZmluZSIsImFtZCIsIndpbmRvdyIsImlmcmFtZVBob25lIiwiZ2xvYmFsIiwic2VsZiIsInQiLCJuIiwiciIsInMiLCJvIiwidSIsImEiLCJyZXF1aXJlIiwiaSIsIkVycm9yIiwiZiIsImNhbGwiLCJsZW5ndGgiLCJzdHJ1Y3R1cmVkQ2xvbmUiLCJIRUxMT19JTlRFUlZBTF9MRU5HVEgiLCJIRUxMT19USU1FT1VUX0xFTkdUSCIsIklGcmFtZUVuZHBvaW50IiwicGFyZW50T3JpZ2luIiwibGlzdGVuZXJzIiwiaXNJbml0aWFsaXplZCIsImNvbm5lY3RlZCIsInBvc3RNZXNzYWdlUXVldWUiLCJoZWxsb0ludGVydmFsIiwicG9zdFRvVGFyZ2V0IiwibWVzc2FnZSIsInRhcmdldCIsInN1cHBvcnRlZCIsInBhcmVudCIsInBvc3RNZXNzYWdlIiwiSlNPTiIsInN0cmluZ2lmeSIsInBvc3QiLCJ0eXBlIiwiY29udGVudCIsImFyZ3VtZW50cyIsInB1c2giLCJwb3N0SGVsbG8iLCJvcmlnaW4iLCJkb2N1bWVudCIsImxvY2F0aW9uIiwiaHJlZiIsIm1hdGNoIiwiYWRkTGlzdGVuZXIiLCJmbiIsInJlbW92ZUFsbExpc3RlbmVycyIsImdldExpc3RlbmVyTmFtZXMiLCJPYmplY3QiLCJrZXlzIiwibWVzc2FnZUxpc3RlbmVyIiwic291cmNlIiwibWVzc2FnZURhdGEiLCJkYXRhIiwicGFyc2UiLCJzdG9wUG9zdGluZ0hlbGxvIiwic2hpZnQiLCJkaXNjb25uZWN0IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIm1lc3NzYWdlTGlzdGVuZXIiLCJpbml0aWFsaXplIiwic3RhcnRQb3N0aW5nSGVsbG8iLCJhZGRFdmVudExpc3RlbmVyIiwic2V0SW50ZXJ2YWwiLCJzZXRUaW1lb3V0IiwiY2xlYXJJbnRlcnZhbCIsImluc3RhbmNlIiwiZ2V0SUZyYW1lRW5kcG9pbnQiLCJQYXJlbnRFbmRwb2ludCIsImdldFBzZXVkb1VVSUQiLCJjaGFycyIsImxlbiIsInJldCIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImpvaW4iLCJJZnJhbWVQaG9uZVJwY0VuZHBvaW50IiwiaGFuZGxlciIsIm5hbWVzcGFjZSIsInRhcmdldFdpbmRvdyIsInRhcmdldE9yaWdpbiIsInBob25lIiwicGVuZGluZ0NhbGxiYWNrcyIsImNyZWF0ZSIsImNhbGxiYWNrT2JqIiwibWVzc2FnZVR5cGUiLCJ2YWx1ZSIsInJldHVyblZhbHVlIiwidXVpZCIsImNsZWFyVGltZW91dCIsInRpbWVvdXQiLCJjYWxsYmFjayIsInVuZGVmaW5lZCIsInRhcmdldFdpbmRvd09ySWZyYW1lRWwiLCJhZnRlckNvbm5lY3RlZENhbGxiYWNrIiwic2VsZk9yaWdpbiIsImhhbmRsZXJzIiwidGFyZ2V0V2luZG93SXNJZnJhbWVFbGVtZW50IiwiZ2V0T3JpZ2luIiwiaWZyYW1lIiwic3JjIiwidFdpbmRvdyIsImdldFRhcmdldFdpbmRvdyIsIm1lc3NhZ2VOYW1lIiwiZnVuYyIsInJlbW92ZUxpc3RlbmVyIiwiY29udGVudFdpbmRvdyIsInJlY2VpdmVNZXNzYWdlIiwiY29uc29sZSIsImxvZyIsImNvbnN0cnVjdG9yIiwiSFRNTElGcmFtZUVsZW1lbnQiLCJGdW5jdGlvbiIsImZlYXR1cmVTdXBwb3J0ZWQiLCJyZXN1bHQiLCJvbm1lc3NhZ2UiLCJwcm90b3R5cGUiLCJ0b1N0cmluZyIsImluZGV4T2YiLCJjcmVhdGVFbGVtZW50IiwiREFUQV9DTE9ORV9FUlIiLCJzdHJ1Y3R1cmVkQ2xvbmVzIl0sIm1hcHBpbmdzIjoiQUFBQSxDQUFDLFNB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