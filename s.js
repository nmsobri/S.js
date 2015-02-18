(function(window) {

    var $ = function(elem) {
        if (this === window && typeof elem !== "function") {
            return new $();
        }

        if (typeof elem === "function") {
            $.ready(elem);
        }

        this.elems = document.getElementById( elem );
        return this;
    };

    $.ready = (function(window) {
        var document = window.document, /*reference to document object*/
            readyBound = false,         /*check if event for dom ready already being attached*/
            callbackQueue = [],         /*list of callback*/
            toplevel = false,           /*check if this window is main windor or inside frame/iframe*/

            ready = function(callback) {
                registerOrRunCallback(callback);
                bindReady();
            },

        /*Register or run callback.If the dom is not ready, que the callback, else invoke it, see DOMReadyCallback*/
            registerOrRunCallback = function(callback) {
                if (typeof  callback === "function") {
                    callbackQueue.push(callback);
                }
            },

        /*Bind DOM ready event*/
            bindReady = function() {
                /*readyBound is closure, it will remember its value.Incase there is multiple call to $.ready,
                 no need to reattach this event again and again if dom is already ready*/
                if (readyBound) {
                    return;
                }

                readyBound = true;
                toplevel = window.frameElement == null;

                /*Catch cases where $.ready is called after the browser ready event has already occurred.*/
                if (document.readyState !== "loading") {
                    DOMReady();
                }

                /*Mozilla, Opera, Webkit and Ie >=9 support this event*/
                if ( document.addEventListener ) {
                    /*Use the handy event callback*/
                    document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
                    /*A fallback to window.onload, that will always work*/
                    window.addEventListener( "load", DOMContentLoaded, false );
                    /*If IE event model is used*/
                } else if ( document.attachEvent ) {
                    /*Ensure firing before onload,maybe late but safe also for iframes*/
                    /*http://stackoverflow.com/questions/10801625/ie-domcontentloaded-documentelement-doscroll*/
                    document.attachEvent( "onreadystatechange", DOMContentLoaded );
                    /*A fallback to window.onload, that will always work*/
                    window.attachEvent( "onload", DOMContentLoaded );
                    /*If IE and not a frame, above method does not work if inside any frame/iframe*/
                    if ( document.documentElement.doScroll && toplevel ) {
                        doScrollCheck();
                    }
                }
            },

            DOMContentLoaded = function() {
                /*Clean up, remove event bind to DOMContentLoaded/onreadystatechange*/
                if (document.addEventListener) {
                    document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
                }
                else {
                    document.detachEvent("onreadystatechange", DOMContentLoaded);
                }
                DOMReady();
            },

            DOMReady = function() {
                /*Make sure that the DOM is not already loaded so we dont call this function multiple times*/
                if (!ready.isReady) {
                    /*Make sure body exists, at least, in case Ie gets a little overzealous (ticket #5443)*/
                    if (!document.body) {
                        return setTimeout(DOMReady, 1);
                    }
                    ready.isReady = true;
                    DOMReadyCallback();
                }
            },

            DOMReadyCallback = function() {
                while (callbackQueue.length) {
                    (callbackQueue.shift())();
                }
                /*When the dom is ready, reevalute this function so any subsequent use of $() to
                 register event, simply invoke it.No need to push it to the queue*/
                registerOrRunCallback = function(callback) {
                    if (typeof callback === "function") {
                        callback();
                    }
                }
            },

            doScrollCheck = function() {
                if (ready.isReady) {
                    return;
                }

                try {
                    /*If IE is used, use the trick by Diego Perini*/
                    /*http://javascript.nwbox.com/IEContentLoaded*/
                    document.documentElement.doScroll("left");
                }
                catch(e) {
                    setTimeout(doScrollCheck, 1);
                    return;
                }
                DOMReady();
            };

        /*Is the DOM ready to be used? Set to true once it occurs*/
        ready.isReady = false;

        return ready;

    })(window);

    window.$ = $;

})(window);











