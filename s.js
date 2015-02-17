function $(elem) {

    if ( this === window ) {
        return new $();
    }

    this.elems = document.getElementById( elem );
    return this;
}