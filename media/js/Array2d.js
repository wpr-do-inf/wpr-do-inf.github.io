var Array2d = (function () {
'use strict';

Array2d = Object.makeSubclass();

Array2d.prototype._init = function () {
    this.rows_ = [];
    this.row_count_ = 0;
    this.col_count_ = 0;
}

Array2d.prototype.getRowCount = function () {
    return this.row_count_;
}

Array2d.prototype.getColCount = function () {
    return this.col_count_;
}

Array2d._createArray = function (size, initial_value) {
    var get_initial_value = null;
    if (typeof(initial_value) == "function") {
        get_initial_value = initial_value;
    } else {
        get_initial_value = function () { return initial_value; }
    }
    var res = [];
    for (var i = 0; i < size; ++i) {
        var val = get_initial_value();
        res.push(val);
    }
    return res;
}

Array2d._resizeArray = function (array, new_size, initial_value) {
    var get_initial_value = null;
    if (typeof(initial_value) == "function") {
        get_initial_value = initial_value;
    } else {
        get_initial_value = function () { return initial_value; }
    }

    if (new_size > array.length) {
        for (var i = array.length; i < new_size; ++i) {
            array.push( get_initial_value() );
        }
    } else {
        array = array.slice(0, new_size);
    }
    return array;
}

Array2d.prototype.setRowCount = function (n, initial_value) {
    if (n < 0) {
        throw 'Array2d.setRowCount: invalid argument: ' + n;
    }
    if (this.row_count_ != n) {
        var self = this;
        this.rows_ = Array2d._resizeArray(self.rows_, n, function () {
            return Array2d._createArray(self.col_count_, initial_value)
        });
        this.row_count_ = n;
    }
}

Array2d.prototype.setColCount = function (n, initial_value) {
    if (n < 0) {
        throw 'Array2d.setRowCount: invalid argument: ' + n;
    }
    if (this.col_count_ != n) {
        for (var i = 0; i < this.row_count_; ++i) {
            this.rows_[i] = Array2d._resizeArray(this.rows_[i], n, initial_value);
        }
        this.col_count_ = n;
    }
}

Array2d.prototype.setSize = function (row_count, col_count, initial_value) {
    this.setRowCount(row_count, initial_value);
    this.setColCount(col_count, initial_value);
}

Array2d.prototype.checkIndices = function (row, col) {
    if (row < 0 || row >= this.row_count_) {
        throw 'Array2d: invalid row index: ' + row;
    }
    if (col < 0 || col >= this.col_count_) {
        throw 'Array2d: invalid col index: ' + col;
    }
}

Array2d.prototype.set = function (row, col, value) {
    this.checkIndices(row, col);
    this.rows_[row][col] = value;
}

Array2d.prototype.get = function (row, col) {
    this.checkIndices(row, col);
    return this.rows_[row][col];
}

Array2d.prototype.toString = function () {
    var res = this.rows_.map(function (row) { 
        var array = row.map(function (el) { return '' + el.toString(); })
        return array.join(' ') + array.length;
    });
    return res.join('|| \n');
}

Array2d.prototype.removeCol = function (index) {
    if (index >= 0 && index < this.col_count_) {
        for (var i = 0; i < this.row_count_; ++i) {
            this.rows_[i].remove(i, i);
        }
        this.col_count_ -= 1;
    } else {
        throw 'Can not remove col with index: ' + index;
    }
}

Array2d.prototype.removeRow = function (index) {
    if (index >= 0 && index < this.row_count_) {
        this.rows_.remove(index, index);
        this.row_count_ -= 1;
    } else {
        throw 'Can not remove row with index: ' + index;
    }
}

return Array2d;

})();
