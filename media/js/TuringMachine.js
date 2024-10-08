var TMStateTransition = (function () {
'use strict';

TMStateTransition = Object.makeSubclass();

TMStateTransition.HEAD_LEFT = 'L';
TMStateTransition.HEAD_RIGHT = 'P';
TMStateTransition.HEAD_STOP = '-';

var AVAILABLE_HEAD_MOVEMENTS = [TMStateTransition.HEAD_LEFT,
    TMStateTransition.HEAD_RIGHT, TMStateTransition.HEAD_STOP];

TMStateTransition.prototype._init = function (from, to, trigger_symbol, new_symbol, head_movement) {
    this.from_ = from;
    this.to_ = to;
    this.trigger_symbol_ = trigger_symbol;
    this.new_symbol_ = new_symbol;
    if (head_movement != undefined && AVAILABLE_HEAD_MOVEMENTS.indexOf(head_movement) == -1) {
        throw 'Unknown head movement: ' + head_movement; 
    }
    this.head_movement_ = head_movement || TMStateTransition.HEAD_RIGHT;
}

TMStateTransition.prototype.toString = function () {
    return 'TMStateTransition [from: ' + this.from_ + ', to: ' + this.to_ 
        + ', trigger symbol: ' + this.trigger_symbol_ 
        + ', new symbol: ' + this.new_symbol_ 
        + ', head move.: ' + this.head_movement_
        + ']';
}

TMStateTransition.prototype.getHeadDelta = function() {
    if (this.head_movement_ == TMStateTransition.HEAD_LEFT) {
        return -1;
    } else if (this.head_movement_ == TMStateTransition.HEAD_RIGHT) {
        return 1;
    }
    return 0;
}

TMStateTransition.isValidHeadMove = function (move) {
    return AVAILABLE_HEAD_MOVEMENTS.indexOf(move) != -1;
}

return TMStateTransition;
})();


var TMState = (function () {
'use strict';

TMState = Object.makeSubclass();

TMState.prototype._init = function (id, description) {
    this.id_ = id;
    this.description_ = description || '';
    this.transitions_ = {};
}

TMState.prototype.getId = function () {
    return this.id_;
}

TMState.prototype.toString = function () {
    return 'TMState [id: ' + this.id_ + ']';
}

TMState.prototype.addTransition = function (dest_state, trigger_symbol, new_symbol, head_movement) {
    var tr = new TMStateTransition(this, dest_state, trigger_symbol, new_symbol, head_movement);
    this.transitions_[trigger_symbol] = tr;
    return tr;
}

TMState.prototype.removeTransition = function (trigger_symbol) {
    if ( !(trigger_symbol in this.transitions_) ) {
        throw 'No transition for symbol: ' + trigger_symbol;
    }
    this.transitions_[trigger_symbol] = null;
}

TMState.prototype.getNextStateForSymbol = function(symbol) {
    if (symbol in this.transitions_) {
        var transition = this.transitions_[symbol];
        return transition.to_;
    }
    return null;
}

TMState.prototype.getTransitionForSymbol = function(symbol) {
    if (symbol in this.transitions_) {
        return this.transitions_[symbol];
    }
    return null;
}


TMState.prototype.exportToMap = function() {
    var res = {};
    res['id'] = this.id_;
    if (this.description_.length > 0) {
        res['description'] = this.description_;
    }
    var transitions = [];
    for(var key in this.transitions_) {
        if (this.transitions_.hasOwnProperty(key)) {
            var tr = this.transitions_[key];
            transitions.push( [tr.trigger_symbol_, tr.new_symbol_, tr.to_.getId(), tr.head_movement_] );
        }
    }
    res['transitions'] = transitions;
    return res;
}


return TMState;
})();



var TuringMachine = 
(function () {
'use strict';

TuringMachine = Object.makeSubclass();

TuringMachine.EMPTY_SYMBOL = '@';
TuringMachine.STATE_ID_PREFIX = 'q';

TuringMachine.prototype._init = function () {
    this.alphabet_ = [];
    this.states_ = [];

    Sig.addSignal(this, 'sig_addState');
    Sig.addSignal(this, 'sig_removeState');
    Sig.addSignal(this, 'sig_addTransition');
    Sig.addSignal(this, 'sig_addSymbol');
    Sig.addSignal(this, 'sig_removeSymbol');

    this.addSymbol(TuringMachine.EMPTY_SYMBOL);
}

TuringMachine.prototype.addSymbol = function (symbol) {
    if (symbol != undefined && this.alphabet_.indexOf(symbol) == -1) {
        this.alphabet_.push(symbol);
        Sig.emit(this, 'sig_addSymbol', symbol);
    }
    return this;
}

TuringMachine.prototype.addSymbols = function (symbols) {
    var self = this;
    symbols.forEach(function (symbol) { self.addSymbol(symbol); });
}

TuringMachine.prototype.getAlphabet = function () {
    return this.alphabet_;
}

TuringMachine.prototype.getAlphabetSize = function () {
    return this.alphabet_.length;
}

TuringMachine.prototype.getStateCount = function () {
    return this.states_.length;
}

TuringMachine.prototype.getStateById = function (id) {
    for (var i = 0; i < this.states_.length; ++i) {
        var state = this.states_[i];
        if (this.states_[i].getId() == id) {
            return this.states_[i];
        }
    }
    return null;
}

TuringMachine.prototype.getStateByIdOrThrow = function (id) {
    var res = this.getStateById(id);
    if (res == null) {
        throw 'No state with id: ' + id;
    }
    return res;
}

TuringMachine.prototype.getStateByIndex = function (idx) {
    idx = parseInt(idx);
    if (idx < 0 || idx >= this.states_.length) {
        throw 'Index out of bounds: ' + idx + ' but states count: ' + this.getStateCount();
    }
    return this.states_[idx];
}

TuringMachine.prototype.getStatesIds = function () {
    var res = [];
    for (var i = 0; i < this.states_.length; ++i) {
        var state = this.states_[i];
        res.push(state.getId());
    }
    return res;
}

TuringMachine.prototype.getNextStateId = function () {
    return TuringMachine.STATE_ID_PREFIX + this.getStateCount();
}

TuringMachine.prototype.addState = function (id, description) {
    if (id == undefined) {
        id = this.getNextStateId();
    }
    if (this.getStateById(id) != null) {
        throw 'State with id "' + id + '" already exists';
    }
    this.states_.push( new TMState(id, description) ); 
    Sig.emit(this, 'sig_addState', id);
    return this;
}

TuringMachine.prototype.addStates = function (states) {
    var self = this;
    states.forEach(function (state_id) { self.addState(state_id); });
}

TuringMachine.prototype.isValidSymbol = function(symbol) {
    return this.alphabet_.indexOf(symbol) != -1;
}

TuringMachine.prototype.addTransition = function (from, trigger_symbol, new_symbol, to, head_movement) {
    var from_state = this.getStateByIdOrThrow(from);
    var to_state = this.getStateByIdOrThrow(to);

    if (!this.isValidSymbol(trigger_symbol)) {
        throw 'Invalid symbol: ' + trigger_symbol;
    }
    if (!this.isValidSymbol(new_symbol)) {
        throw 'Invalid symbol: ' + new_symbol;
    }
    var trans = from_state.addTransition(to_state, trigger_symbol, new_symbol, head_movement);
    Sig.emit(this, 'sig_addTransition', trans);
    return trans;
}

TuringMachine.prototype.addTransitionFromString = function (str) {
    var args = str.split(' ');
    return TuringMachine.prototype.addTransition.apply(this, args);
}

TuringMachine.prototype.removeTransition = function (from, trigger_symbol) {
    var from_state = this.getStateByIdOrThrow(from);
    if (!this.isValidSymbol(trigger_symbol)) {
        throw 'Invalid symbol: ' + trigger_symbol;
    }
    from_state.removeTransition(trigger_symbol);
}


TuringMachine.prototype.removeState = function (state_id) {
    var state_to_remove = this.getStateByIdOrThrow(state_id);
    var self = this;
    this.alphabet_.forEach(function (symbol) {
        try {
            self.removeTransition(state_id, symbol);
        } catch (e) {
        }
    });
    var idx = this.states_.indexOf(state_to_remove);
    this.states_.remove(idx, idx);
    Sig.emit(this, 'sig_removeState', state_id);
}

TuringMachine.prototype.removeSymbol = function (symbol) {
    if (this.isValidSymbol(symbol)) {
        var self = this;
        this.states_.forEach(function (state) {
            try {
                self.removeTransition(state.getId(), symbol);
            } catch (e) {
            }
        });
        var idx = this.alphabet_.indexOf(symbol);
        this.alphabet_.remove(idx, idx);
        Sig.emit(this, 'sig_removeSymbol', symbol);
    }
}

TuringMachine.prototype.updateAlphabet = function (new_symbols) {
    var old_symbols = this.alphabet_.slice(0);
    new_symbols.push(TuringMachine.EMPTY_SYMBOL);

    for (var i = 0; i < old_symbols.length; ++i) {
        var old = old_symbols[i];
        if( new_symbols.indexOf(old) == -1 ) {
            this.removeSymbol(old);
        }
    }
    for (var i = 0; i < new_symbols.length; ++i) {
        var new_ = new_symbols[i];
        if (!this.isValidSymbol(new_)) {
            this.addSymbol(new_);
        }
    }
}

TuringMachine.prototype.clear = function () {
    var self = this;
    var states_copy = this.states_.slice(0, this.states_.length);
    states_copy.forEach(function (state) {
        self.removeState(state.getId());
    });
    var alphabet_copy = this.alphabet_.slice(0, this.alphabet_.length);
    alphabet_copy.forEach(function (symbol) {
        self.removeSymbol(symbol);
    });
}

/**
 * Create a new machine with empty alphabet and only one state
 */
TuringMachine.prototype.newMachine = function () {
    this.clear();
    this.addSymbol(TuringMachine.EMPTY_SYMBOL);
    this.addState('q0');
}

TuringMachine.prototype.importFromMap = function (desc) {
    try {
        this.clear();

        var self = this;

        this.addSymbols( desc['alphabet'] );

        var states_desc = desc['states'];

        for(var key in states_desc) {
            if (states_desc.hasOwnProperty(key)) {
                self.addState( key, states_desc[key]['description'] );    
            }
        }

        for(var key in states_desc) {
            if (states_desc.hasOwnProperty(key)) {
                var state_id = key;
                var transitions = states_desc[state_id]['transitions'];

                transitions.forEach(function (trans_desc) {
                    if (trans_desc.length == 4) {
                        self.addTransition( state_id, trans_desc[0], trans_desc[1], trans_desc[2], trans_desc[3] );
                    }
                });
            }
        }
    } catch (e) {
        alert('Error while importing program: ' + e);
    }
}

TuringMachine.prototype.exportToMap = function () {
    var res = {};
    res['alphabet'] = this.alphabet_;
    
    var states = {};
    this.states_.forEach(function (state) {
        states[state.getId()] = state.exportToMap();
    });
    res['states'] = states;
    return res;
}

return TuringMachine;
})();
