//==============================================================================
// TMProgramTableMockView
//==============================================================================

var TMProgramTableMockView = (function () {
'use strict';

var CellView = Object.makeSubclass();

CellView.prototype._init = function (row, col, model) {
    this.row_ = row;
    this.col_ = col;
    this.model_ = model
    this.text_ = '';
}

CellView.prototype.edit = function (next_state, next_symbol, head_move) {
    if (this.model_.isValid(next_state, next_symbol, head_move)) {
        this.model_.changeTransitionForCell(this.row_, this.col_, next_state, next_symbol, head_move);
    }
}

CellView.prototype.setText = function (text) {
    this.text_ = text;
}

CellView.prototype.toString = function () {
    return this.text_;
}

TMProgramTableMockView = Object.makeSubclass();

TMProgramTableMockView.prototype._init = function () {
    this.cells_ = new Array2d();
    this.model_ = null;
}

TMProgramTableMockView.prototype.setModel = function (model) {
    this.model_ = model;
}

TMProgramTableMockView.prototype.setSize = function (row, col) {
    this.cells_.setSize(row, col);
    for (var r = 0; r < row; ++r) {
        for (var c = 0; c < col; ++c) {
            this.cells_.set(r, c, new CellView(r, c, this.model_));
        }
    }
}

TMProgramTableMockView.prototype.setText = function (row, col, str) {
    this.cells_.get(row, col).setText(str);
}

TMProgramTableMockView.prototype.setState = function (row, col, state) {
}

TMProgramTableMockView.prototype.toString = function () {
    return this.cells_.toString();
}

TMProgramTableMockView.prototype.getCellView = function (row, col) {
    return this.cells_.get(row, col);
}

TMProgramTableMockView.prototype.getCellText = function (row, col) {
    return this.getCellView(row, col).toString();
}

return TMProgramTableMockView;

})();

//==============================================================================
// TMProgramTableViewModel
//
// Class responsible for tabular display of the Turing's machine program
//==============================================================================

var TMProgramTableViewModel = (function () {
'use strict';


//==============================================================================
// Cell - auxiliary inner class for holding table's cell contents
//==============================================================================
//
var Cell = Object.makeSubclass();

Cell.prototype._init = function () {
    this.text_ = '';
    this.state_ = null;
    this.transition_ = null;
}

Cell.prototype.setText = function (text) {
    this.text_ = text;
}

Cell.prototype.getText = function () {
    return this.text_;
}

Cell.prototype.setState = function (state) {
    this.state_ = state;
}


TMProgramTableViewModel = Object.makeSubclass();

TMProgramTableViewModel.prototype._init = function (simulator, view) {
    this.simulator_ = simulator;
    this.view_ = view;
    this.machine_ = simulator.getMachine();
    this.cells_ = new Array2d();
    this.states_indices_ = {};
    this.symbols_indices_ = {};

    this.view_.setModel(this);
    this.setSize(this.machine_.getAlphabetSize() + 1, // + 1 for the header
                 this.machine_.getStateCount() + 1);  // + 1 for the header

    this.simulator_.addTransitionObservers(this);

    Sig.connect(this.machine_, "sig_addState", this, this.onAddState);
    Sig.connect(this.machine_, "sig_removeState", this, this.removeState);
    Sig.connect(this.machine_, "sig_addTransition", this, this.setTransition);
    Sig.connect(this.machine_, "sig_addSymbol", this, this.addSymbol);
    Sig.connect(this.machine_, "sig_removeSymbol", this, this.removeSymbol);
}

TMProgramTableViewModel.prototype.setSize = function (row_count, col_count) {
    this.cells_.setSize(row_count, col_count, function () {
        return new Cell();
    });

    this.view_.setSize(row_count, col_count);

    this.symbols_indices_ = {};
    this.states_indices_ = {};

    var alphabet = this.machine_.getAlphabet();
    for (var r = 1; r < this.cells_.getRowCount(); ++r) {
        var symbol = alphabet[r-1];
        this.cells_.get(r, 0).setText(symbol);
        this.view_.setText(r, 0, symbol);
        this.symbols_indices_[symbol] = r;
    }

    for (var c = 1; c < this.cells_.getColCount(); ++c) {
        var state = this.machine_.getStateByIndex(c-1);
        var state_id = state.getId();
        this.cells_.get(0, c).setText(state_id);
        var view_text = state_id;
        if (state.description_ != '') {
            view_text += '<br/><span>' + state.description_ + '</span>';
        }
        this.view_.setText(0, c, view_text);
        this.states_indices_[state_id] = c;
    }

    for (var i = 0; i < this.machine_.getStateCount(); ++i) {
        var state = this.machine_.getStateByIndex(i);
        var state_idx = this.states_indices_[state.getId()];

        for (var j = 0; j < alphabet.length; ++j) {
            var symbol = alphabet[j];
            var t = state.getTransitionForSymbol(symbol);
            if (t != null) {
                this.setTransition(t);
            }
        }
    }
}

TMProgramTableViewModel.prototype.changeTransitionForCell = function (row, col, next_state_id, new_symbol, head_move) {
    var from_state_id = this.machine_.getStateByIndex(col-1).getId();
    var old_symbol = this.machine_.getAlphabet()[row-1];
    var tr = this.machine_.addTransition(from_state_id, old_symbol, new_symbol, next_state_id, head_move);
    /*this.setTransition(tr);*/
}

TMProgramTableViewModel.prototype.setTransition = function (tr) {
    var state_idx = this.states_indices_[tr.from_.getId()];
    var symbol_idx = this.symbols_indices_[tr.trigger_symbol_];
    this.cells_.get(symbol_idx, state_idx).transition_ = tr; 

    var str = tr.to_.getId() + ' ' + tr.new_symbol_ + ' ' + tr.head_movement_;
    this.view_.setText(symbol_idx, state_idx, str);
}

TMProgramTableViewModel.prototype.removeState = function (state_id) {
    var state_idx = this.states_indices_[state_id];

    console.log('TMProgramTableViewModel.removeState: ' + state_id + ' state_idx: ' + state_idx);
    this.view_.removeCol(state_idx);

    this.cells_.removeCol(state_idx);

    delete this.states_indices_[state_id];

    for (var prop in this.states_indices_) {
        if (this.states_indices_.hasOwnProperty(prop)) {
        }
    }

    for (var prop in this.states_indices_) {
        if (this.states_indices_.hasOwnProperty(prop)) {
            var idx = this.states_indices_[prop];
            if (idx > state_idx) {
                this.states_indices_[prop] = idx - 1;
            }
        }
    }
}

TMProgramTableViewModel.prototype.removeSymbol = function (symbol) {
    var symbol_idx = this.symbols_indices_[symbol];
    this.view_.removeRow(symbol_idx);
    this.cells_.removeRow(symbol_idx);

    delete this.symbols_indices_[symbol];

    for (var prop in this.symbols_indices_) {
        if (this.symbols_indices_.hasOwnProperty(prop)) {
            var idx = this.symbols_indices_[prop];
            if (idx > symbol_idx) {
                this.symbols_indices_[prop] = idx - 1;
            }
        }
    }
}

TMProgramTableViewModel.prototype.getCellText = function (row, col) {
    var cell = this.cells_.get(row, col);
    return this.cells_.get(row, col).getText();
}

TMProgramTableViewModel.prototype.onTransitionInit = function () {
    var alphabet = this.machine_.getAlphabet();
    for (var i = 0; i < this.machine_.getStateCount(); ++i) {
        var state = this.machine_.getStateByIndex(i);
        var state_idx = this.states_indices_[state.getId()];

        for (var j = 0; j < alphabet.length; ++j) {
            var symbol = alphabet[j];
            var symbol_idx = this.symbols_indices_[symbol];
            this.view_.setState(symbol_idx, state_idx, null);
        }
    }
}

TMProgramTableViewModel.prototype.onTransitionChange = function (curr_trans, next_trans) {
    var state_idx = -1; 
    var symbol_idx = -1; 

    if (curr_trans != null) {
        state_idx = this.states_indices_[curr_trans.from_.getId()];
        symbol_idx = this.symbols_indices_[curr_trans.trigger_symbol_];
        this.view_.setState(symbol_idx, state_idx, null);
    }     
    if (next_trans != null) {
        state_idx = this.states_indices_[next_trans.from_.getId()];
        symbol_idx = this.symbols_indices_[next_trans.trigger_symbol_];
        this.view_.setState(symbol_idx, state_idx, 'current');
    }
}

TMProgramTableViewModel.prototype.onSymbolReadWrite = function (curr_trans, symbol, next_symbol) {
    console.log('TMProgramTableViewModel.onSymbolReadWrite: ' + symbol + ', ' + next_symbol);
}

TMProgramTableViewModel.prototype.isValid = function (next_state, next_symbol, head_move) {
    if (!(next_state in this.states_indices_) 
        || !(next_symbol in this.symbols_indices_) 
        || !(TMStateTransition.isValidHeadMove(head_move)) ) {
        return false;        
    }
    return true;
}

TMProgramTableViewModel.prototype.onAddState = function (new_state) {
    console.log('New state added to view: ' + this.cells_.getColCount());
    this.setSize(this.cells_.getRowCount(), this.cells_.getColCount() + 1);
}

TMProgramTableViewModel.prototype.addSymbol = function(symbol) {
    this.setSize(this.cells_.getRowCount() + 1, this.cells_.getColCount());
}

return TMProgramTableViewModel;

})();
