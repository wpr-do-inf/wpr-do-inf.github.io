function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}


var UI = observable({});

UI.TM_PROGRAM_CHANGED = 'tm_program_changed';
UI.TM_SHOW_GRAPH = 'tm_show_graph';
UI.TM_CURRENT_STATE_CHANGED = 'tm_current_state_changed';


var TMSim = (function () {
    var api = {};
    var tm = {
        states: [],
        state_labels: {},
        symbols: [],
        actions: [],
        tape: [],
        head: 0,
        current_state: null,
        tape_input: [],
        next_action: null,
        num_states: 0,
        head_starts_from_right: false
    };
    var tm_states = [];
    var tm_states_redo = [];
    var TM_PROGRAM = 'TM_PROGRAM';
    var EMPTY_SYMBOL = '#';

    api.get_tm = function () {
        return tm;
    }

    function push_tm_state() {
        tm_states.push( JSON.stringify(tm) );
        tm_states_redo = [];

        localStorage.setItem(TM_PROGRAM, dump_machine_to_string());
    }


    function pop_tm_state() {
        if (tm_states.length > 0) {
            var state = tm_states.pop();
            tm = JSON.parse(state);
            tm_states_redo.push(state);
        }
    }


    function dump_machine_to_string() {
        return JSON.stringify(tm);
    }
    api.dump_machine_to_string = dump_machine_to_string;


    function load_machine_from_string(str) {
        tm_states = [];
        tm = JSON.parse(str);
    }
    api.load_machine_from_string = load_machine_from_string;


    function parse_state_number(state_id) {
        var match = state_id.match(/q(\d+)/);
        if (match) {
            return parseInt(match[1]);
        }
        return -1;
    }


    function set_action(state, symbol, next_state, new_symbol, move) {
        push_tm_state();

        state = state.toLowerCase();
        next_state = next_state.toLowerCase();
        var action = get_action(state, symbol);

        if (action != null) { /* update */
            action.new_symbol = new_symbol;
            action.next_state = next_state;
            action.move = move;
        } else { /* Add new action */
            tm.actions.push( {
                state: state,
                symbol: symbol,
                new_symbol: new_symbol,
                next_state: next_state,
                move: move
            });
        }
        UI.trigger(UI.TM_PROGRAM_CHANGED);
    }
    api.set_action = set_action;


    function get_action(state, symbol) {
        var found = false;
        for (var i = 0, len = tm.actions.length; i < len; i++) {
            var action = tm.actions[i];
            if (action.symbol == symbol && action.state == state) {
                return action;
            }
        }
        return null;
    }
    api.get_action = get_action;


    api.get_state_actions = function (state_id) {
        var actions = [];
        tm.actions.forEach( function (action) {
            if (action.state == state_id) {
                actions.push(action);
            }
        } );
        return actions;
    }


    function has_state(state) {
        return tm.states.indexOf(state) != -1;
    }


    api.is_final_state = function (state) {
        var is_final = false;
        if (has_state(state)) {
            is_final = true;

            for (var i = 0, len = tm.actions.length; i < len; i++) {
                var action = tm.actions[i];
                if (action.state == state && has_state(action.next_state)) {
                    is_final = false;
                    break ;
                }
            }
        }
        return is_final;
    }


    function set_num_states(num_states) {
        assert(num_states >= 1, 'Number of states should be non-zero');
        assert(num_states < 50, 'num_states too large');

        push_tm_state();
        var states = [];
        for (var i = 0; i < num_states; ++i) {
            var name = 'q' + i;
            states.push(name);
            if (!tm.state_labels.hasOwnProperty(name)) {
                tm.state_labels[name] = '';
            }
        }
        tm.states = states;
        tm.states.forEach(function (state) {
            tm.symbols.forEach(function (symbol) {
                if (get_action(state, symbol) == null) {
                    set_action(state, symbol, '-', '-', '-');
                }
            });
        });
        tm.num_states = num_states;
    }
    api.set_num_states = set_num_states;


    function get_states() {
        return tm.states;
    }
    api.get_states = get_states;


    function get_state_label(state_id) {
        if (state_id in tm.state_labels) {
            return tm.state_labels[state_id];
        }
        return '';
    }
    api.get_state_label = get_state_label;


    function set_state_label(state_id, label) {
        push_tm_state();
        if (tm.states.indexOf(state_id) != -1) {
            tm.state_labels[state_id] = label;
        }
    }
    api.set_state_label = set_state_label;


    function remove_unnecessary_actions() {
        tm.actions = tm.actions.filter(function (a) { return is_symbol_valid(a.symbol); });
    }


    function get_num_states() { return tm.num_states; }
    api.get_num_states = get_num_states;


    function set_symbols(symbols) {
        assert(symbols.length < 50, 'Too many symbols');
        push_tm_state();
        var complete_symbols = [EMPTY_SYMBOL].concat(symbols);
        var unique_symbols = [];
        for (var i = 0; i < complete_symbols.length; ++i) {
            if (unique_symbols.indexOf(complete_symbols[i]) == -1) {
                unique_symbols.push(complete_symbols[i]);
            }
        }
        tm.symbols = unique_symbols;
        remove_unnecessary_actions();
        UI.trigger(UI.TM_PROGRAM_CHANGED);
    }
    api.set_symbols = set_symbols;


    function get_symbols() {
        return tm.symbols;
    }
    api.get_symbols = get_symbols;


    function is_symbol_valid(symbol) {
        return tm.symbols.indexOf(symbol) != -1;
    }
    api.is_symbol_valid = is_symbol_valid;


    function set_tape_input(str) {
        push_tm_state();
        tm.tape = [];
        tm.tape_input = str.split('');

        for (var i = 0, len = str.length; i < len; i++) {
            tm.tape.push({
                index: i,
                symbol: str[i]
            });
        }
        tm.current_state = tm.states[0];
        tm.head = tm.head_starts_from_right ? tm.tape.length-1 : 0;
        set_next_action();
        UI.trigger(UI.TM_CURRENT_STATE_CHANGED, tm.current_state, tm.next_action);
    }
    api.set_tape_input = set_tape_input;


    function get_tape_input() {
        return tm.tape_input;
    }
    api.get_tape_input = get_tape_input;


    function are_symbols_valid(symbols) {
        for (var i = 0; i < symbols.length; ++i) {
            if (!is_symbol_valid(symbols[i])) {
                return false;
            }
        }
        return true
    }
    api.are_symbols_valid = are_symbols_valid;


    function set_tape_symbol(pos, symbol) {
        assert(!isNaN(pos));

        var found = false;
        for (var i = 0, len = tm.tape.length; i < len; i++) {
            var cell = tm.tape[i];
            if (cell.index == pos) {
                cell.symbol = symbol;
                found = true;
                break;
            }
        }
        if (!found) {
            tm.tape.push( { index: pos, symbol: symbol } );
        }
    }
    api.set_tape_symbol = set_tape_symbol;


    function get_tape_symbol(index) {
        for (var i = 0, len = tm.tape.length; i < len; i++) {
            var cell = tm.tape[i];
            if (cell.index == index) {
                return cell.symbol;
            }
        }
        return EMPTY_SYMBOL;
    }
    api.get_tape_symbol = get_tape_symbol;


    api.get_current_state = function () { return tm.current_state; };


    api.get_next_action = function () { return tm.next_action; };


    function get_current_tape_symbols(margin) {
        var res = [];
        for (var i = tm.head - margin; i < tm.head + margin; i++) {
            res.push( get_tape_symbol(i) );
        }
        return res;
    }
    api.get_current_tape_symbols = get_current_tape_symbols;


    function clear() {
        tm.current_state = tm.states[0];
        tm.head = 0;
        set_symbols([]);
        set_num_states(1);
        set_next_action();
    }
    api.clear = clear;


    function move_head(move) {
        if (move == 'L') {
            tm.head -= 1;
        } else if (move == 'P' || move == 'R') {
            tm.head += 1;
        }
    }


    api.set_head_starts_from_right = function (enabled) {
        tm.head_starts_from_right = enabled ? true : false;

        var first_non_empty = undefined;
        var last_non_empty = undefined;
        tm.tape.forEach(function(cell) {
            if (cell.symbol != EMPTY_SYMBOL) {
                if (last_non_empty == undefined || last_non_empty < cell.index) {
                    last_non_empty = cell.index;
                }
                if (first_non_empty == undefined || first_non_empty > cell.index) {
                    first_non_empty = cell.index;
                }
            }
        });
        tm.head = enabled ? last_non_empty : first_non_empty;
    }


    api.is_start_from_right_enabled = function () {
        return tm.head_starts_from_right;
    }


    function set_next_action() {
        tm.next_action = get_action(tm.current_state, get_tape_symbol(tm.head));
    }


    function is_valid_action(action) {
        return action != null && action.next_state != '-';
    }


    function make_move() {
        var action = get_action(tm.current_state, get_tape_symbol(tm.head));
        if (is_valid_action(action)) {
            push_tm_state();
            set_tape_symbol(tm.head, action.new_symbol);
            tm.current_state = action.next_state;
            move_head(action.move);
            set_next_action();

            UI.trigger(UI.TM_CURRENT_STATE_CHANGED, tm.current_state, tm.next_action);
        } else {
            console.log('No action for the current state and symbol: ' + tm.current_state );
        }
    }
    api.make_move = make_move;


    function reset() {
        set_tape_input(tm.tape_input.join(''));
        tm_states = [];
    }
    api.reset = reset;


    function undo_move() {
        pop_tm_state();
        UI.trigger(UI.TM_CURRENT_STATE_CHANGED, tm.current_state, tm.next_action);
    }
    api.undo_move = undo_move;


    api.clear_storage = function () {
        localStorage.removeItem(TM_PROGRAM);
    }


    function run_example() {
        set_symbols('01.,'.split(''));
        set_num_states(3);
        set_action('q0', '0', 'q1', '1', 'P');
        set_action('q0', '1', 'q1', '0', 'P');

        set_action('q1', EMPTY_SYMBOL, 'q2', '1', 'P');
        set_num_states(3);
        set_action('q0', '0', 'q1', '1', 'P');
        set_action('q0', '1', 'q1', '0', 'P');

        set_action('q1', EMPTY_SYMBOL, 'q2', '1', 'P');
        set_action('q1', '0', 'q1', '0', 'P');
        set_action('q1', '1', 'q1', '1', 'P');
        set_action('q1', '.', 'q1', '.', 'P');
        set_action('q1', '0', 'q1', '0', 'P');
        set_action('q1', '1', 'q1', '1', 'P');
        set_action('q1', '.', 'q1', '.', 'P');
        set_action('q1', ',', 'q1', ',', 'P');

        set_tape_input('0.1011');
        reset();
        for (var i = 0; i < 0; ++i) {
            make_move();
        }
    }


    function start() {
        var prev_tm = localStorage.getItem(TM_PROGRAM);
        if (prev_tm != null) {
            console.log('Loading machine from local storage');
            load_machine_from_string(prev_tm);
        } else {
            run_example();
        }
    }

    start();

    return api;
})();
