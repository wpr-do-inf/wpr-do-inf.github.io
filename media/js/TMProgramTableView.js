//==============================================================================
// TMProgramTableView
//==============================================================================

var TMProgramTableView = (function () {
'use strict';

var TableCell = Object.makeSubclass();

TableCell.prototype._init = function (element, row, col, is_active, model) {
    this.element_ = element;
    this.prev_class_ = null;
    this.row_ = row;
    this.col_ = col;
    if (is_active) {
        this.element_.click(function () {
            console.log('Cell clicked: ' + row + ', ' + col);
            var args = element.text().split(' ');
            showTransitionEditDialog(args, function(next_state, next_symbol, head_move) {
                model.changeTransitionForCell(row, col, next_state, next_symbol, head_move);
            });
        });
    }
}

TableCell.prototype.setText = function (text) {
    this.element_.html(text);
}

TableCell.prototype.setState = function (state) {
    if (state == null) {
        this.element_.removeClass(this.prev_class_);
    } else {
        this.element_.addClass(state);
    }
    this.prev_class_ = state;
}

TableCell.prototype.remove = function () {
    this.element_.remove();
}


TMProgramTableView = Object.makeSubclass();

TMProgramTableView.prototype._init = function (wrapper) {
    $(wrapper).append('<table class="program_table_view"></table>');

    this.container_ = $(wrapper).find('.program_table_view').last();
    this.cells_ = new Array2d();
    this.model_ = null;
}

TMProgramTableView.prototype.setSize = function (rows, cols) {
    this.container_.html('');
    this.cells_.setSize(rows, cols);

    for (var r = 0; r < rows; ++r) {
        this.container_.append('<tr></tr>');
        var row = this.container_.find('tr').last();
        for (var c = 0; c < cols; ++c) {
            var type = (c == 0 || r == 0) ? 'th' : 'td';
            var tag = '<' + type + '/>';
            row.append(tag);
            var is_active = (r > 0 && c > 0);
            this.cells_.set(r, c, new TableCell(row.find(type).last(), r, c, is_active, this.model_));
        }
    }
    this.setText(0, 0, 'Symb./stan');
}

TMProgramTableView.prototype.getRowCount = function () {
    return this.cells_.getRowCount();
}

TMProgramTableView.prototype.getColCount = function () {
    return this.cells_.getColCount();
}

TMProgramTableView.prototype.setState = function (row, col, state) {
    this.cells_.get(row, col).setState(state);
}

TMProgramTableView.prototype.setText = function (row, col, text) {
    this.cells_.get(row, col).setText(text);
}

TMProgramTableView.prototype.setModel = function (model) {
    this.model_ = model;
}

TMProgramTableView.prototype.removeCol = function (index) {
    if (index >= 0 && index < this.cells_.getColCount()) {
        for (var i = 0; i < this.cells_.getRowCount(); ++i) {
            this.cells_.get(i, index).remove();
        }
        this.cells_.removeCol(index);
    }
}

TMProgramTableView.prototype.removeRow = function (index) {
    if (index >= 0 && index < this.cells_.getRowCount()) {
        for (var i = 0; i < this.cells_.getColCount(); ++i) {
            this.cells_.get(index, i).remove();
        }
        this.cells_.removeRow(index);
    }
}

return TMProgramTableView;
})();


