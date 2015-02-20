function getElementsBySelector(selectors) { // 'div#main .selected a[href^="#"], div#body span a.active'
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

    /*Grab all of the tagName elements within current context*/
    var getElements = function(context,tag) {
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
    };

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

                found = getElements(context,tag);
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
                if ((match = element.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?['"]?([^\]'"]*)['"]?\]$/))) { /*http://stackoverflow.com/questions/2576571/assign-variable-in-if-condition-statement-good-practice-or-not*/
                    tag = match[1];
                    attr = match[2];
                    operator = match[3];
                    value = match[4] || null; /*tag attribute with operator but without value (a[href^] or a[href^=]) make it behave like tag with attribute only (a[href]), it will always match all element with that attribute, ignoring the operator.*/
                    /*this is because tag without value will will make value = "", and indexOf will always match "" at position 0*/
                }

                found = getElements(context,tag);
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
            context = getElements(context,element);
        }

        /*we finish parsing a single selector, if there is any match, push it to selected variable*/
        for (var m = 0; m < context.length; m++) {
            selected.push(context[m]);
        }
    }

    /*We finish parsing all selector, return the result please*/
    return selected;
}