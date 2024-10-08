//==============================================================================
// TMTapeMockView
//==============================================================================

var TMTapeMockView = (function () {
'use strict';

var MockCell = Object.makeSubclass();

MockCell.prototype._init = function () {
    this.text_ = '';
    this.state_ = null;
}

TMTapeMockView = Object.makeSubclass();

TMTapeMockView.prototype._init = function () {
    this.cell_count_ = 0;
    this.cells_ = [];
}

TMTapeMockView.prototype.setCellCount = function (n) {
    this.cell_count_ = n;
    this.cells_ = [];
    for (var i = 0; i < n; ++i) {
        this.cells_.push(new MockCell());
    }
}


TMTapeMockView.prototype.getCell = function (idx) {
    if (idx < 0 || idx >= this.cell_count_) {
        throw 'TMTapeMockView.getCell: invalid index: ' + idx;
    }
    return this.cells_[idx];
}

TMTapeMockView.prototype.setCellState = function (idx, state) {
    this.getCell(idx).state_ = state;
}

TMTapeMockView.prototype.setCellText = function (idx, text) {
    this.getCell(idx).text_ = text;
}

TMTapeMockView.prototype.toString = function () {
    var res = [];
    for (var i = 0; i < this.cell_count_; ++i) {
        res.push( this.cells_[i].text_ );
    }
    return res.join('');
}

return TMTapeMockView;
})();


//==============================================================================
// TMTapeViewModel
//==============================================================================

var TMTapeViewModel = (function () {
'use strict';

var TapeCell = Object.makeSubclass();

TapeCell.prototype._init = function (index, symbol) {
    this.index_ = index;
    this.symbol_ = symbol;
    this.is_highlighted_ = false;
}

TMTapeViewModel = Object.makeSubclass();

TMTapeViewModel.DEFAULT_CELL_COUNT = 11;
TMTapeViewModel.MARGIN_SIZE = 2;

TMTapeViewModel.prototype._init = function (tm_simulator, view) {
    this.simulator_ = tm_simulator;
    this.tape_ = tm_simulator.tape_;
    this.view_ = view;
    this.cell_count_ = 0;
    this.left_cell_index_ = 0;
    this.right_cell_index_ = 0;
    this.margin_ = TMTapeViewModel.MARGIN_SIZE;
    this.head_position_ = 0;

    this.setCellCount(TMTapeMockView.DEFAULT_CELL_COUNT);

    this.tape_.addObserver(this);
    this.simulator_.addObserver(this);
}

TMTapeViewModel.prototype.setCellCount = function (n) {
    this.cell_count_ = n;
    this.view_.setCellCount(n);
    this.left_cell_index_ = -Math.floor(this.cell_count_ / 2) + this.margin_;
    this.right_cell_index_ = Math.floor(this.cell_count_ / 2) - this.margin_;
    this.initCellsContents();
}

TMTapeViewModel.prototype.globalToLocalPos = function (pos) {
    if (pos < this.left_cell_index_) {
        return this.margin_;
    } else if (pos > this.right_cell_index_) {
        return this.cell_count_ - this.margin_;
    }
    var res = Math.floor(this.cell_count_ / 2) + pos;
    return res;
}

TMTapeViewModel.prototype.isShiftNecessary = function (pos) {
    if ((pos < this.left_cell_index_) ||
        (pos > this.right_cell_index_)) {
        return true;
    }
    return false;
}

TMTapeViewModel.prototype.initCellsContents = function () {
    var pos = this.head_position_ - this.globalToLocalPos(this.head_position_);
    for (var i = 0; i < this.cell_count_; ++i, ++pos) {
        this.view_.setCellText(i, this.tape_.getSymbol(pos));
    }
}

TMTapeViewModel.prototype.onHeadMove = function (new_pos) {
    this.view_.setCellState(this.globalToLocalPos(this.head_position_), null);

    this.head_position_ = new_pos;
    if (this.isShiftNecessary(new_pos)) {
        this.initCellsContents();
    }
    this.view_.setCellState(this.globalToLocalPos(this.head_position_), 'current');
}

TMTapeViewModel.prototype.onHeadSymbolReadWrite = function (curr, new_symbol) {
    this.view_.setHeadViewHtml(curr + ' &rightarrow; ' + new_symbol);
}

TMTapeViewModel.prototype.onSetSymbol = function (pos, symbol) {
    this.view_.setCellText( this.globalToLocalPos(pos), symbol );
}

TMTapeViewModel.prototype.onTapeInit = function () {
    this.onHeadMove(0);
    this.initCellsContents();
}

return TMTapeViewModel;
})();

