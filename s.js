(function(window) {

    var fn = {
        getElements : function(context,tag) { /*Grab all of the tagName elements within current context*/
            if (!tag) {
                tag = "*";
            }

            /*Get elements matching tag, filter them for class selector/attribute selector*/
            var found = [], ctx = null, elems = null;

            for (var a = 0; a < context.length; a++) {
                ctx = context[a];
                if (tag == '*') {
                    elems = ctx.all ? ctx.all : ctx.getElementsByTagName("*");
                }
                else {
                    elems = ctx.getElementsByTagName(tag);
                }

                for(var b = 0; b < elems.length; b++) {
                    found.push(elems[b]);
                }
            }
            return found;
        },

        selector: function(selectors) { // 'div#main .selected a[href^="#"], div#body span a.active'
            var selected = [], parts = null, tag = null, found = null,fnd = null,
                operator = null,attr = null, value = null,selector = null, context = null,
                tokens = null, element = null, left_bracket = null, right_bracket = null,
                pos = null,id = null, elem = null, class_name = null;

            /*if browser dont support getElementsByTagName, fail gracefully*/
            if(!document.getElementsByTagName) {
                return selected;
            }

            /*Remove the 'beutification' spaces*/
            selectors = selectors.replace(/(^\s+|\s+$)/g, "");

            /*Split multiple selector*/
            selectors = selectors.split(",");

            Comma:
            for (var i = 0; i < selectors.length; i++) {
                selector=selectors[i]; // 'div#main .selected a[href^="#"]'
                context = [document];
                tokens = selector.split(" "); // [div#main, .selected, a[href^="#"]]

                Space:
                for (var j = 0; j < tokens.length; j++) { // div#main
                    element = tokens[j];

                    /*This part is to make sure that it is not part of a CSS3 Selector*/
                    left_bracket = element.indexOf("[");
                    right_bracket = element.indexOf("]");

                    pos = element.indexOf("#"); /*Id*/                            /*pos + 1 because in case of "#wrapper", indexOf("#") will return 0, and 0 is evaluate to false, thus that is why we +1*/
                    if (pos+1 && !(pos > left_bracket && pos < right_bracket) ) { /*check the position of "#", since the "#" can exist between css3 bracket/attribute like a[href^="#"](find all link that its href start with "#")*/
                        parts = element.split("#");
                        tag = parts[0]; // div
                        id = parts[1]; // main
                        elem = document.getElementById(id);

                        if (!elem || (tag && elem.nodeName.toLowerCase() !== tag)) { /*if element not exist, check for next token.if element and tag exist, make sure element with the id we found have designated tag.*/
                            continue Comma; /*Specified element not found, check for next selector*/
                        }
                        context = [elem];
                        continue Space; /*Element found, check for next token*/
                    }

                    pos = element.indexOf("."); /*Class*/
                    if( pos+1 && !(pos > left_bracket && pos < right_bracket) ) { /*check the position of ".", since the "." can exist between css3 bracket/attribute like a[href$=".net"](find all link that its href end with ".net")*/
                        parts = element.split('.');
                        tag = parts[0];
                        class_name = parts[1];

                        found = this.getElements(context,tag);
                        context = [];

                        for (var k=0; k<found.length; k++) {
                            fnd = found[k];
                            if (fnd.className && fnd.className.match(new RegExp('\\b'+class_name+'\\b'))){ /*check if this element has class name attribute and matching class name*/
                                context.push(fnd);
                            }
                        }

                        if (context.length === 0) {
                            continue Comma;
                        }
                        continue Space;
                    }

                    if(element.indexOf('[')+1) { /*If the "[" appears, that means it needs CSS3 parsing*/
                        /*Code to deal with attribute selectors*/
                        if ((match = element.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?['"]?([^\]'"]*)['"]?]$/))) { /*http://stackoverflow.com/questions/2576571/assign-variable-in-if-condition-statement-good-practice-or-not*/
                            tag = match[1];
                            attr = match[2];
                            operator = match[3];
                            value = match[4] || null; /*tag attribute with operator but without value (a[href^] or a[href^=]) make it behave like tag with attribute only (a[href]), it will always match all element with that attribute, ignoring the operator.*/
                            /*this is because tag without value will will make value = "", and indexOf will always match "" at position 0*/
                        }

                        found = this.getElements(context,tag);
                        context = [];

                        for (var l = 0; l<found.length; l++) {
                            fnd = found[l];
                            if(operator=='=' && fnd.getAttribute(attr) !== value) continue; /*Check an element with an attribute name of attr and whose value is exactly "value"*/
                            if(operator=='~' && !fnd.getAttribute(attr).match(new RegExp('(^|\\s)'+value+'(\\s|$)'))) continue; /*Check an element with an attribute name of attr whose value is a whitespace-separated list of words, one of which is exactly "value"*/
                            if(operator=='|' && !fnd.getAttribute(attr).match(new RegExp('^'+value+'-?'))) continue; /*Check an element with an attribute name of attr. Its value can be exactly “value” or can begin with "value" immediately followed by "-"*/
                            if(operator=='^' && fnd.getAttribute(attr).indexOf(value) !== 0) continue; /*Check an element with an attribute name of attr and whose value is started by "value"*/
                            if(operator=='$' && fnd.getAttribute(attr).lastIndexOf(value)!== (fnd.getAttribute(attr).length-value.length)) continue; /*Check an element with an attribute name of attr and whose value is ended by "value"*/
                            if(operator=='*' && !(fnd.getAttribute(attr).indexOf(value)+1)) continue; /*Check an element with an attribute name of attr and whose value contains at least one occurrence of string "value" as substring*/
                            if(!fnd.getAttribute(attr)) continue; /*Check an element with an attribute name of attr*/
                            context.push(fnd);
                        }

                        if (context.length === 0) {
                            continue Comma;
                        }
                        continue Space;
                    }

                    /*Tag selectors - not a class nor id nor attribute selector*/
                    context = this.getElements(context,element);
                }

                /*we finish parsing a single selector, if there is any match, push it to selected variable*/
                for (var m = 0; m < context.length; m++) {
                    selected.push(context[m]);
                }
            }

            /*We finish parsing all selector, return the result please*/
            return selected;
        }
    };

    var $ = function(elem) {
        if (this === window && typeof elem === "string") {
            return new $(elem);
        }

        if (typeof elem === "function") {
            return $.ready(elem); /*need to return or this function will be pass to the fn.selector that is expecting a string not a function*/
        }

        var elems = fn.selector(elem);
        for (var i = 0; i < elems.length; i++) {
            this[i] = elems[i];
        }

        this.length = elems.length;
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











