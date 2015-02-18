function $(elem) {

    if ( this === window ) {
        return new $();
    }

    this.elems = document.getElementById( elem );
    return this;
}


$.ready = function(fn) {

    var callbacks = [];
    var fired = false;

    /*call this when the document is ready*/
    /*this function protects itself against being called more than once*/
    function ready() {
        if (!fired) {
            // this must be set to true before we start calling callbacks
            fired = true;
            for (var i = 0; i < callbacks.length; i++) {
                // if a callback here happens to add new ready handlers,
                // the docReady() function will see that it already fired
                // and will schedule the callback to run right after
                // this event loop finishes so all handlers will still execute
                // in order and no new ones will be added to the readyList
                // while we are processing the list
                callbacks[i].call(window);
            }
            /*allow any closures held by these functions to free*/
            callbacks = [];
        }
    }

    function scrollCheck() {
        if ( ReadyObj.isReady ) {
            return;
        }

        try {
            document.documentElement.doScroll("left");
        } catch(e) {
            setTimeout( scrollCheck, 1 );
            return;
        }

        /*and execute any waiting functions*/
        ready();
    }

    /* Mozilla, Opera, webkit and ie >=9*/
    if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', ready, false);
    }

    /*prior to ie9*/
    else if (document.attachEvent) {

        /*if document not is not inside a frame http://stackoverflow.com/questions/10801625/ie-domcontentloaded-documentelement-doscroll*/
        if ( document.documentElement.doScroll && window.frameElement == null) {
            scrollCheck();
        }

        /*above method does not work if inside any frame/iframe*/
        else {
            document.attachEvent('onreadystatechange', function() {
                if (document.readyState == 'interactive') { /*https://developer.mozilla.org/en-US/docs/Web/API/document.readyState*/
                    ready();
                }
            });
        }
    }


    if (fired) {
        setTimeout(function() {callback(context);}, 1);
        return;
    } else {
        // add the function and context to the list
        callbacks.push(fn);
    }
};