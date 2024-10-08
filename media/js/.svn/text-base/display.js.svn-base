/**
 * Author: Rafał Skinderowicz
 */
/*******************************************************************************
 * Display class
 *******************************************************************************/

function Display (wrapper_element, rows, cols) {
    this.wrapper_element_ = $(wrapper_element);
    this.rowCount_ = parseInt(rows);
    this.colCount_ = parseInt(cols);

    if (!arguments.callee.count) {
        arguments.callee.count = 0;
    }
    /* Unique display id */
    this.id_ = 'display' + arguments.callee.count++;

    this.origin_ = { 'row_' : 0, 'col_' : 0 };
}

Display.prototype.init = function () {
    this.wrapper_element_.html('');
    this.wrapper_element_.append('<table id="' + this.id_ + '" class="display" cellpadding="0" cellspacing="0"></table>');

    this.table_ = this.wrapper_element_.find('table').first();
    this.table_.hide();
    
    this.rows_ = [];
    for (var r = 0; r < this.rowCount_; ++r) {
        this.table_.append('<tr></tr>');
        var row = this.table_.find('tr').last();

        for (var c = 0; c < this.colCount_; ++c) {
            row.append('<td>&nbsp;</td>');
        }

        this.rows_.push( row ); 
    }
    this.table_.show();
    this.cells_ = new Map(); /* Cells cache for faster access */
}

Display.prototype.setOrigin = function (row, col) {
    this.origin_.row_ = parseInt(row);
    this.origin_.col_ = parseInt(col);
}

Display.prototype.getCell = function (row, col) {
    if (row < 0 || row >= this.rowCount_ || col < 0 || col >= this.colCount_) {
        throw 'Cell index out of display bounds: row: ' + row + ' col: ' + col;
    }
    var coords = new Point(row, col); 
    var cell = this.cells_.get(coords);
    if (cell === undefined) {
        cell = this.rows_[row].find('td').eq(col);
        this.cells_.put(coords, cell);
    }
    return cell;
}

Display.prototype.setCellValue = function(row, col, value) {
    row += this.origin_.row_;
    col += this.origin_.col_;

    var cell = this.getCell(row, col);
    cell.html(value);
}

Display.prototype.setCellCSSClasses = function(row, col, classes) {
    row += this.origin_.row_;
    col += this.origin_.col_;

    var cell = this.getCell(row, col);
    cell.removeClass();
    if (classes) {
        cell.addClass(classes);
    }
}
