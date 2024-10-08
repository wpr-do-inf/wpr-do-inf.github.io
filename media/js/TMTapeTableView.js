//==============================================================================
// TMTapeTableView
//==============================================================================

var TMTapeTableView = (function () {
'use strict';

var DivCell = Object.makeSubclass();

DivCell.prototype._init = function (element) {
    this.element_ = element;
    this.prev_class_ = null;
}

DivCell.prototype.setText = function (text) {
    if (text == TuringMachine.EMPTY_SYMBOL) {
        text = '<span class="tm-empty-symbol">' + text + '</span>';
    }
    this.element_.html(text);
}

DivCell.prototype.setState = function (state) {
    if (state == null) {
        this.element_.removeClass(this.prev_class_);
    } else {
        this.element_.addClass(state);
    }
    this.prev_class_ = state;
}

DivCell.prototype.getPosition = function () {
    return this.element_.offset();
}

TMTapeTableView = Object.makeSubclass();

TMTapeTableView.prototype._init = function (wrapper) {
    $(wrapper).append('<div class="tape_view"></div>');

    this.container_ = $(wrapper).find('.tape_view').last();
    this.cell_count_ = 0;
    this.cells_ = [];

    $(wrapper).append('<div class="tape_head_view"><div id="spike"></div><div></div></div>');
    this.head_view_container_ = $(wrapper).find('.tape_head_view').last();
}

TMTapeTableView.prototype.setCellCount = function (n) {
    this.cell_count_ = n;
    this.cells_ = [];
    this.container_.html('');
    for (var i = 0; i < n; ++i) {
        this.container_.append('<div class="tape_cell"></div>');
        var el = this.container_.find('.tape_cell').last();
        this.cells_.push(new DivCell(el));
    }
}


TMTapeTableView.prototype.getCell = function (idx) {
    if (idx < 0 || idx >= this.cell_count_) {
        throw 'TMTapeTableView.getCell: invalid index: ' + idx;
    }
    return this.cells_[idx];
}

TMTapeTableView.prototype.setCellState = function (idx, state) {
    this.getCell(idx).setState(state);
    if (this.head_view_container_ && state != null) {
        var pos = this.getCell(idx).getPosition();
        var width = this.head_view_container_.width();
        this.head_view_container_.css('left', pos.left - width / 2);
    }
}

TMTapeTableView.prototype.setCellText = function (idx, text) {
    this.getCell(idx).setText(text);
}

TMTapeTableView.prototype.setHeadViewHtml = function (html) {
    if (this.head_view_container_) {
        this.head_view_container_.find('div:last').html(html);
    }
}

return TMTapeTableView;
})();


