Function.prototype.makeSubclass= function() {
    function Class() {
        if ('_init' in this)
            this._init.apply(this, arguments);
    }
    Function.prototype.makeSubclass.nonconstructor.prototype= this.prototype;
    Class.prototype= new Function.prototype.makeSubclass.nonconstructor();
    return Class;
};

Function.prototype.makeSubclass.nonconstructor= function() {};

/**
 * Sample usage:
 
Shape= Object.makeSubclass();
Shape.prototype._init= function(x, y) {
    this.x= x;
    this.y= y;
};

Point= Shape.makeSubclass();

Circle= Shape.makeSubclass();
Circle.prototype._init= function(x, y, r) {
    Shape.prototype._init.call(this, x, y);
    this.r= r;
};
*/
