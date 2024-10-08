/**
 * Author: Rafał Skinderowicz
 */
function BoardsManager() {
    if ( arguments.callee._singletonInstance ) {
        return arguments.callee._singletonInstance;
    }
    arguments.callee._singletonInstance = this;

    var boards_ = [];
    var steps_ = null;
    var curr_step_ = -1;

    this.addBoard = function(board) {
        boards_.push(board); 
    }

    var initSteps = function () {
        steps_ = [];
        for (var i = 0; i < boards_.length; ++i) {
            var b = boards_[i];
            for (var j = 0; j < b.getTransactionsCount(); ++j) {
                steps_.push( [b, j] );
            }
        }
    }

    this.nextStep = function () {
        if (steps_ == null) {
            initSteps();
        }
        var index = curr_step_ + 1;
        if (index < steps_.length) {
            var step = steps_[index];

            step[0].execTransaction(step[1]);

            curr_step_ = index;
            return true;
        }
        return false;
    }

    this.prevStep = function () {
        if (steps_ == null) {
            initSteps();
        }
        var index = curr_step_;
        if (index >= 0) {
            var step = steps_[index];

            step[0].undoTransaction(step[1]);

            curr_step_ = index - 1;
            return true;
        }
        return false;
    }

    this.execAll = function () {
        while (this.nextStep()) {
            ;
        }
    }

    this.undoAll = function () {
        while (this.prevStep()) {
            ;
        }
    }

    this.reset = function () {
        steps_ = null;
        boards_ = [];
        curr_step_ = -1;
    }
}
