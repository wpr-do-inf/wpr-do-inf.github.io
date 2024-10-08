//==============================================================================
// TMSimulator
//==============================================================================

var TMSimulator = (function () {
'use strict';

TMSimulator = Object.makeSubclass();

TMSimulator.prototype._init = function (machine) {
    this.machine_ = machine;
    this.tape_ = new TMTape();
    this.steps_count_ = 0;
    this.current_state_ = machine.getStateByIndex(0);
    this.head_position_ = 0;
    this.head_observers_ = [];
    this.transition_observers_ = [];
    this.tape_initial_state_ = '';
    this.step_phase_ = 0;
    this.prev_symbol_ = null;
}

TMSimulator.prototype.initTape = function (string) {
    this.tape_.initFromString(string);
    this.tape_initial_state_ = string;

    this.current_state_ = this.machine_.getStateByIndex(0);
    var curr = this.current_state_;
    this.step_phase_ = 0;
    this.moveHead(0);
    var symbol = this.tape_.getSymbol(this.head_position_);
    var trans = curr.getTransitionForSymbol(symbol);

    if (trans != null) {
        this.transition_observers_.forEach(function (observer) {
            observer.onTransitionInit();
            observer.onTransitionChange(null, trans);
        });
        this.head_observers_.forEach(function (observer) {
            observer.onHeadSymbolReadWrite(trans.trigger_symbol_, trans.new_symbol_);
        });
    }
}

TMSimulator.prototype.getTapeInitialState = function () {
    return this.tape_initial_state_;
}

TMSimulator.prototype.makeStep = function () {
    if (this.step_phase_ == 0) {
        if (this.stepReadWriteSymbol()) {
            this.step_phase_ = 1;
        }
    } else if (this.step_phase_ == 1) {
        if (this.stepMoveHead()) {
            this.step_phase_ = 0;
        }
    }
}

TMSimulator.prototype.stepReadWriteSymbol = function () {
    var curr = this.current_state_;
    var symbol = this.tape_.getSymbol(this.head_position_);
    var trans = curr.getTransitionForSymbol(symbol);
    if (trans != null) {
        this.tape_.setSymbol(this.head_position_, trans.new_symbol_);
        this.prev_symbol_ = symbol;

        this.transition_observers_.forEach(function (observer) {
            observer.onSymbolReadWrite(trans, symbol, trans.new_symbol_);
        });
        return true;
    }
    return false;
}

TMSimulator.prototype.stepMoveHead = function () {
    var curr = this.current_state_;
    var symbol = this.prev_symbol_;
    var trans = curr.getTransitionForSymbol(symbol);
    if (trans != null) {
        this.moveHead(this.head_position_ + trans.getHeadDelta());
        this.current_state_ = trans.to_;
        this.steps_count_ += 1;

        var next_trans = this.current_state_.getTransitionForSymbol( this.tape_.getSymbol(this.head_position_) );

        this.transition_observers_.forEach(function (observer) {
            observer.onTransitionChange(trans, next_trans);
        });
        this.head_observers_.forEach(function (observer) {
            observer.onHeadSymbolReadWrite(next_trans.trigger_symbol_, next_trans.new_symbol_, next_trans);
        });
        return true;
    }
    return false;
}

TMSimulator.prototype.moveHead = function (pos) {
    this.head_position_ = pos;
    var self = this;
    this.head_observers_.forEach(function (observer) {
        observer.onHeadMove(self.head_position_);
    });
}

TMSimulator.prototype.makeSteps = function (count) {
    for (var i = 0; i < count; ++i) {
        this.makeStep();
    }
}

TMSimulator.prototype.addObserver = function (observer) {
    this.head_observers_.push(observer);
}

TMSimulator.prototype.addTransitionObservers = function (observer) {
    this.transition_observers_.push(observer);
}

TMSimulator.prototype.getStepsCount = function () {
    return this.steps_count_;
}

TMSimulator.prototype.getCurrentState = function () {
    return this.current_state_;
}

TMSimulator.prototype.getTape = function () {
    return this.tape_;
}

TMSimulator.prototype.getMachine = function () {
    return this.machine_;
}

TMSimulator.prototype.toJSON = function () {
    var res = {};
    res['tape_initial_state'] = this.tape_initial_state_;
    res['program'] = this.machine_.exportToMap();
    return JSON.stringify(res);
}

TMSimulator.prototype.initFromJSON = function (json_str) {
    try {
        console.log('JSON: ' + json_str);
        var desc = JSON.parse(json_str);

        this.machine_.importFromMap(desc['program']);

        this.steps_count_ = 0;
        this.current_state_ = this.machine_.getStateByIndex(0);

        this.initTape(desc['tape_initial_state']);
    } catch (e) {
        alert('Error while importing program: ' + e);
    }
}

return TMSimulator;
})();
