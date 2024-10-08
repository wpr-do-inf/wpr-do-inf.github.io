/**
 * Author: Rafał Skinderowicz
 */
var Sig;
if (!Sig) {
    Sig = {};
}

(function() {
    'use strict';

    /* Array Remove - By John Resig (MIT Licensed) */
    Array.prototype.remove = function(from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };

    /* Signal */
    function Signal(obj, name) {
        this.obj = obj;
        this.name = name;
        this.slots = []; /* remember the connected slots */
    }

    Signal.prototype.equals = function(other) {
        return (this.obj == other.obj) && (this.name == other.name);
    }

    Signal.prototype.addSlot = function(slot) {
        if (this.findSlotIndex(slot) == -1) {
            this.slots.push(slot);
        }
    }

    Signal.prototype.findSlotIndex = function(slot) {
        for (var i = 0; i < this.slots.length; ++i) {
            if (this.slots[i].equals(slot)) {
                return i;
            }
        }
        return -1;
    }

    Signal.prototype.emit = function(args) {
        for (var i = 0; i < this.slots.length; ++i) {
            this.slots[i].fire(args);
        }
    }

    Signal.prototype.removeSlot = function(slot) {
        var index = this.findSlotIndex(slot);
        if (index != -1) {
            this.slots.splice(index, 1);
        }
    }
    /* ~Signal */

    /* Slot, there is no restriction about compatibility between signals and
     * slots */

    /* A slot has an object and a method of the object which should be called
     * when the signal is emitted
     */
    function Slot(obj, fun) {
        this.obj = obj;
        this.fun = fun;
    }

    Slot.prototype.equals = function(other) {
        return (this.obj == other.obj) && (this.fun == other.fun);
    }

    Slot.prototype.fire = function(args) {
        this.fun.apply(this.obj, args);
    }
    /* ~Slot */

    var signals = [];

    function findSignalIndex(signal) {
        for (var i = 0; i < signals.length; ++i) {
            if (signals[i].equals(signal)) {
                return i;
            }
        }
        return -1;
    }

    function findSignal(signalObj, signalName) {
        var index = findSignalIndex(new Signal(signalObj, signalName));
        return (index != -1) ? (signals[index]) : null;
    }

    function addSignal(obj, name) {
        var newSignal = new Signal(obj, name);
        if (findSignalIndex(newSignal) == -1) {
            signals.push(newSignal);
        }
    }

    function removeSignal(obj, name) {
        var index = findSignalIndex(new Signal(obj, name));
        if (index != -1) {
            signals.remove(index);
        }
    }

    function connect(signalObj, signalName, slotObj, slotFun) {
        var sig = new Signal(signalObj, signalName);
        var index = findSignalIndex(sig);

        if (index == -1) {
            throw "No [" + signalName + "] signal defined!";
        } else {
            signals[index].addSlot( new Slot(slotObj, slotFun) );
        }
    }

    function emit(signalObj, signalName) {
        var signal = findSignal(signalObj, signalName);
        if (signal != null) {
            var args = Array.prototype.slice.call(arguments, 2);
            signal.emit(args);
        } else {
            throw "No such signal defined!";
        }
    }

    function emitAndRemoveSignal(signalObj, signalName) {
        emit.apply(this, arguments);
        removeSignal(signalObj, signalName);
    }

    /*
     * Remove given slot from all signals with the signalName
     */
    function removeSlot(signalObj, signalName, slotObj, slotFun) {
        var signal = findSignal(signalObj, signalName);
        if (signal) {
            var slot = new Slot(slotObj, slotFun);
            signal.removeSlot(slot);
        }
    }

    Sig.addSignal = addSignal;
    Sig.removeSignal = removeSignal;
    Sig.connect = connect;
    Sig.emit = emit;
    Sig.emitAndRemoveSignal = emitAndRemoveSignal;
    Sig.removeSlot = removeSlot;
})();
