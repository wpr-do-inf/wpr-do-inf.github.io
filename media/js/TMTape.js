//==============================================================================
// TMTape
//==============================================================================

var TMTape = (function () {
'use strict';

TMTape = Object.makeSubclass();

TMTape.EMPTY_SYMBOL = TuringMachine.EMPTY_SYMBOL;

TMTape.prototype._init = function () {
    this.entries_ = { 0 : TMTape.EMPTY_SYMBOL };
    this.observers_ = [];
}

TMTape.prototype.setSymbol = function(idx, symbol) {
    idx = parseInt(idx);
    this.entries_[idx] = symbol;

    this.observers_.forEach(function (observer) {
        observer.onSetSymbol(idx, symbol);
    });
}

TMTape.prototype.getSymbol = function(idx) {
    if (idx in this.entries_) {
        return this.entries_[idx];
    }
    return TMTape.EMPTY_SYMBOL;
}

TMTape.prototype.getContentsAsString = function () {
    var min_idx = 0;
    var max_idx = 0;
    var entries = this.entries_;

    Object.keys( entries ).map(function( key ) {
        if (key > max_idx) {
            max_idx = key;
        } else if (key < min_idx) {
            min_idx = key;
        }
    });

    var cells = [];
    var len = max_idx - min_idx + 1;
    for (var i = 0; i < len; ++i) {
        cells.push(TMTape.EMPTY_SYMBOL); 
    }

    Object.keys( entries ).map(function( key ) {
        var idx = key - min_idx;
        cells[idx] = entries[idx];
    });
    return cells.join('');
}

TMTape.prototype.initFromString = function (string) {
    this.entries_ = { 0 : TMTape.EMPTY_SYMBOL };

    for (var i = 0; i < string.length; ++i) {
        this.setSymbol(i, string[i]);
    }
    this.observers_.forEach(function (observer) {
        observer.onTapeInit();
    });
}

TMTape.prototype.addObserver = function (observer) {
    if (this.observers_.indexOf(observer) == -1) {
        this.observers_.push(observer);
    }
}

return TMTape;
})();


