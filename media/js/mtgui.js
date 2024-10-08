var Button = ReactBootstrap.Button;
var Input = ReactBootstrap.Input;

var ActionCell = React.createClass({
    displayName: 'ActionCell',

    shouldComponentUpdate: function (next_props) {
        return next_props.html !== this.getDOMNode().innerHTML;
    },

    handleChange: function () {
        var contents = this.getDOMNode().innerText;
        if (contents !== this.prev_contents) {
            this.onChange(contents);
        }
        this.prev_contents = contents;
    },

    onChange: function (val) {
        if (val.toLowerCase() == 'sb' || val == '-/-/-') {
            TMSim.set_action(this.props.state, this.props.symbol, '-', '-', '-');
        } else {
            var symbols = TMSim.get_symbols();
            var escaped_symbols = symbols.map(function (symbol) {
                return symbol.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
            });
            var separated_symbols = escaped_symbols.join('|');
            var num_states = TMSim.get_num_states();
            var extra_state = 'q' + num_states;
            var pat = "(" + TMSim.get_states().join('|') + "|" + extra_state + ")/(" + separated_symbols + ")/" + "(P|L|R|\-)";
            var re = new RegExp(pat, "i");
            var tokens = re.exec(val);

            if (tokens) {
                var new_state = tokens[1];
                var new_symbol = tokens[2];
                var head_move = tokens[3];
                TMSim.set_action(this.props.state, this.props.symbol, new_state, new_symbol, head_move);
                this.forceUpdate();
            } else {
                console.log('Invalid input: ' + val);
            }
        }
    },

    onKeyDown: function (e) {
        switch (e.keyCode) {
            case 13: // 'Enter' key
            case 27:
                // 'Escape' key
                e.preventDefault();
                e.stopPropagation();
                break;
        }
    },

    onFocus: function () {
        select_inner_text(this.refs.action_input.getDOMNode());
    },

    render: function () {
        var state = this.props.state;
        var symbol = this.props.symbol;
        var action = TMSim.get_action(state, symbol);
        var repr = '-/-/-';
        if (action) {
            repr = action.next_state + '/' + action.new_symbol + '/' + action.move;
        }
        if (repr == '-/-/-') {
            repr = TMSim.is_final_state(state) ? 'SK' : 'SB';
        }
        if (repr.length > 8) {
            repr = repr.substring(0, 8);
        }
        var next_action = TMSim.get_tm().next_action;
        var class_name = repr == 'SB' ? 'dim' : 'normal';

        if (next_action && next_action.state == state && next_action.symbol == symbol) {
            class_name = "highlight";
        }

        return React.createElement(
            'td',
            { className: class_name },
            React.createElement('span', {
                ref: 'action_input',
                onInput: this.handleInput,
                onBlur: this.handleChange,
                onKeyDown: this.onKeyDown,
                onFocus: this.onFocus,
                contentEditable: 'true',
                dangerouslySetInnerHTML: { __html: repr } })
        );
    }

});

function select_inner_text(el) {
    var range, selection;

    if (window.getSelection && document.createRange) {
        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(el);
        selection.removeAllRanges();
        selection.addRange(range);
    } else if (document.selection && document.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(el);
        range.select();
    }
}

var StateCell = React.createClass({
    displayName: 'StateCell',

    shouldComponentUpdate: function (nextProps) {
        return nextProps.html !== this.getDOMNode().innerHTML;
    },

    handleChange: function () {
        var html = this.refs.state_label.getDOMNode().innerText;
        if (html !== this.lastHtml) {
            this.onChange(html);
        }
        this.lastHtml = html;
    },

    onChange: function (val) {
        var state = this.props.state;
        TMSim.set_state_label(state, new String(val));
    },

    onKeyDown: function (e) {
        switch (e.keyCode) {
            case 13: // 'Enter' key
            case 27:
                // 'Escape' key
                prevent_propagation();
                e.target.blur(); // On enter - blur the current element
                break;
        }
    },

    render: function () {
        var state = this.props.state;
        var repr = TMSim.get_state_label(state);
        if (repr.length == 0) {
            repr = 'etykieta';
        } else if (repr.length > 16) {
            repr = repr.substring(0, 16);
        }

        return React.createElement(
            'th',
            { className: 'state_cell' },
            React.createElement(
                'span',
                { className: 'state_name' },
                state
            ),
            React.createElement('span', { className: 'state_label',
                ref: 'state_label',
                onInput: this.handleInput,
                onBlur: this.handleChange,
                onKeyDown: this.onKeyDown,
                contentEditable: 'true',
                placeHolder: 'etykieta',
                dangerouslySetInnerHTML: { __html: repr } })
        );
    }

});

var ProgramTable = React.createClass({
    displayName: 'ProgramTable',

    render: function () {
        var states = TMSim.get_states();
        var symbols = TMSim.get_symbols();
        var head_row = [];
        head_row.push(React.createElement(
            'th',
            null,
            '~'
        ));
        for (var i = 0; i < states.length; ++i) {
            head_row.push(React.createElement(StateCell, { state: states[i] }));
        }
        var rows = [];
        for (var i = 0; i < symbols.length; ++i) {
            var symbol = symbols[i];
            var cells = states.map(function (state) {
                return React.createElement(ActionCell, { state: state, symbol: symbol });
            });
            rows.push(React.createElement(
                'tr',
                null,
                React.createElement(
                    'th',
                    null,
                    symbols[i]
                ),
                cells
            ));
        }

        return React.createElement(
            'table',
            { className: 'program-table' },
            React.createElement(
                'thead',
                null,
                React.createElement(
                    'tr',
                    null,
                    head_row
                )
            ),
            React.createElement(
                'tbody',
                null,
                rows
            )
        );
    }

});

var TapeView = React.createClass({
    displayName: 'TapeView',

    render: function () {
        var head = TMSim.get_tm().head;
        var left = Math.min(head - 3, -5);
        var right = Math.max(head + 3, 15);

        var symbols = [];
        for (var i = left; i < right; ++i) {
            var cell = null;
            if (i == head) {
                cell = React.createElement(
                    'td',
                    null,
                    React.createElement('div', { className: 'arrow-down' }),
                    TMSim.get_tape_symbol(i)
                );
            } else {
                cell = React.createElement(
                    'td',
                    null,
                    TMSim.get_tape_symbol(i)
                );
            }
            symbols.push(cell);
        }

        return React.createElement(
            'table',
            { className: 'tape' },
            React.createElement(
                'tr',
                null,
                symbols
            )
        );
    }

});

var Spinner = React.createClass({
    displayName: 'Spinner',

    _update_value: function (delta) {
        var raw_value = this.refs.input.getDOMNode().value;
        var parsed = parseInt(raw_value);
        if (!isNaN(parsed) && parsed + delta >= 2) {
            var new_value = parsed + delta;
            this.refs.input.getDOMNode().value = new_value;
            this.on_input_change();
        }
    },

    up_button_clicked: function () {
        this._update_value(1);
    },

    down_button_clicked: function () {
        this._update_value(-1);
    },

    on_input_change: function () {
        var raw_value = this.refs.input.getDOMNode().value;
        if (this.props.onChange) {
            this.props.onChange(raw_value);
        }
    },

    render: function () {
        return React.createElement(
            'div',
            null,
            React.createElement(
                'label',
                null,
                this.props.label
            ),
            React.createElement(
                'div',
                {
                    className: 'input-group spinner' },
                React.createElement('input', {
                    className: 'form-control',
                    type: 'text',
                    ref: 'input',
                    defaultValue: this.props.initialValue,
                    onChange: this.on_input_change
                }),
                React.createElement(
                    'div',
                    {
                        className: 'input-group-btn-vertical' },
                    React.createElement(
                        'button',
                        {
                            className: 'btn btn-default',
                            type: 'button',
                            onClick: this.up_button_clicked
                        },
                        React.createElement('i', { className: 'fa fa-caret-up' })
                    ),
                    React.createElement(
                        'button',
                        {
                            className: 'btn btn-default',
                            type: 'button',
                            onClick: this.down_button_clicked
                        },
                        React.createElement('i', { className: 'fa fa-caret-down' })
                    )
                )
            )
        );
    }

});

var ProgamLink = React.createClass({
    displayName: 'ProgamLink',

    getInitialState: function () {
        return { has_url: false };
    },

    get_tm_url: function () {
        var tm_str = TMSim.dump_machine_to_string();
        var compr = LZString.compressToEncodedURIComponent(tm_str);
        /* decompressFromEncodedURIComponent */
        Arg.urlUseHash = true;
        var url = Arg.url({ 'tm': compr });
        this.state.url = url;
        this.state.has_url = true;
        this.forceUpdate();
    },

    render: function () {
        var link = '';
        if (this.state.has_url) {
            var href = this.state.url;
            link = React.createElement(
                'a',
                { href: href },
                'Link do twojej MT'
            );
        }
        return React.createElement(
            'div',
            null,
            React.createElement(
                Button,
                {
                    className: 'btn-sm',
                    onClick: this.get_tm_url
                },
                'Pobierz link do maszyny'
            ),
            React.createElement(
                'p',
                null,
                link
            )
        );
    }

});

var MTApp = React.createClass({
    displayName: 'MTApp',

    getInitialState: function () {
        TMSim.reset();
        return {
            tm: TMSim.get_tm()
        };
    },

    componentWillMount: function () {
        var params = Arg.hash();
        if ('tm' in params) {
            var decompressed = LZString.decompressFromEncodedURIComponent(params['tm']);
            if (decompressed) {
                TMSim.load_machine_from_string(decompressed);
            }
        }
    },

    make_move: function () {
        TMSim.make_move();
        this.forceUpdate();
    },

    reset: function () {
        TMSim.reset();
        this.forceUpdate();
    },

    undo_move: function () {
        TMSim.undo_move();
        this.forceUpdate();
    },

    handle_input_data_change: function () {
        var input = this.refs.input_data.getValue();
        var filtered = input.split('').filter(function (symbol) {
            return TMSim.is_symbol_valid(symbol);
        });
        TMSim.set_tape_input(filtered.join(''));

        this.forceUpdate();
    },

    input_data_validation_state: function () {
        var res = 'default';
        if (this.refs.input_data) {
            var input = this.refs.input_data.getValue();
            if (TMSim.are_symbols_valid(input.split('')) == false) {
                res = 'error';
            }
        }
        return res;
    },

    handle_input_symbols_change: function () {
        function is_valid_alphabet_symbol(symbol) {
            return (/\w|[,\+\.=:/-]/.test(symbol)
            );
        }

        var input = this.refs.input_symbols.getValue();
        var symbols = input.split('').filter(is_valid_alphabet_symbol);
        TMSim.set_symbols(symbols);
        this.forceUpdate();
    },

    input_symbols_validation_state: function () {
        return 'default';
    },

    handle_states_count_change: function (value) {
        if (!isNaN(value) && 2 <= value && value <= 20) {
            TMSim.set_num_states(value);
            this.forceUpdate();
        }
    },

    new_machine: function () {
        TMSim.clear_storage();
        window.location.href = './mt.html';
    },

    show_graph: function () {
        UI.trigger(UI.TM_SHOW_GRAPH);
    },

    set_head_starts_from_right: function () {
        var input = $(this.refs.head_starts_from_right.refs.input.getDOMNode());
        var start_from_right = input.is(':checked');
        TMSim.set_head_starts_from_right(start_from_right);
        this.forceUpdate();
    },

    render: function () {
        var tape_input = TMSim.get_tape_input();
        var alphabet = TMSim.get_symbols();
        var num_states = TMSim.get_num_states();
        var head_starts_from_right = TMSim.is_start_from_right_enabled();
        return React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
                'div',
                {
                    className: 'col-xs-12' },
                React.createElement(
                    'h2',
                    null,
                    'Symulator Maszyny Turinga'
                ),
                React.createElement(
                    'div',
                    {
                        className: 'row' },
                    React.createElement(
                        'div',
                        {
                            className: 'col-lg-4' },
                        React.createElement(Input, {
                            type: 'text',
                            placeholder: 'Np. 012',
                            label: 'Dopuszczalne symbole wejściowe',
                            ref: 'input_symbols',
                            defaultValue: alphabet.join('').replace(/#/, ''),
                            bsStyle: this.input_symbols_validation_state(),
                            onChange: this.handle_input_symbols_change })
                    ),
                    React.createElement(
                        'div',
                        {
                            className: 'col-lg-4' },
                        React.createElement(Spinner, {
                            initialValue: num_states,
                            label: 'Liczba stanów',
                            onChange: this.handle_states_count_change
                        })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-lg-12' },
                        React.createElement(ProgramTable, { key: 'program_table' })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-lg-4' },
                        React.createElement(Input, {
                            type: 'text',
                            placeholder: 'Ciąg wejściowy',
                            label: 'Dane wejściowe dla programu MT',
                            ref: 'input_data',
                            value: tape_input.join(''),
                            bsStyle: this.input_data_validation_state(),
                            onChange: this.handle_input_data_change })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-lg-12' },
                        React.createElement(Input, {
                            type: 'checkbox',
                            label: 'Głowica po prawej stronie',
                            ref: 'head_starts_from_right',
                            checked: head_starts_from_right,
                            onChange: this.set_head_starts_from_right
                        })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-lg-12' },
                        React.createElement(
                            'div',
                            null,
                            React.createElement(
                                'strong',
                                null,
                                'Podgląd taśmy'
                            )
                        ),
                        React.createElement(TapeView, null),
                        React.createElement(
                            'div',
                            { className: 'button-panel' },
                            React.createElement(
                                Button,
                                {
                                    className: 'btn-sm btn-primary',
                                    onClick: this.make_move
                                },
                                'Nast. krok'
                            ),
                            React.createElement(
                                Button,
                                {
                                    className: 'btn-sm',
                                    onClick: this.undo_move
                                },
                                'Cofnij'
                            ),
                            React.createElement(
                                Button,
                                {
                                    className: 'btn-sm',
                                    onClick: this.reset
                                },
                                'Od początku'
                            ),
                            React.createElement(
                                Button,
                                {
                                    className: 'btn-sm btn-warning',
                                    onClick: this.new_machine
                                },
                                'Nowa maszyna'
                            )
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-lg-12' },
                        React.createElement(ProgamLink, null)
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-lg-12' },
                        React.createElement(
                            Button,
                            {
                                className: 'btn-sm btn-primary',
                                onClick: this.show_graph,
                                ref: 'show_graph_button'
                            },
                            'Pokaż graf'
                        )
                    )
                )
            )
        );
    }
});

$(document).ready(function () {
    React.render(React.createElement(MTApp, null), document.getElementById('tm-wrapper'));
    $(window).on('hashchange', function () {
        window.location.reload();
    });
});

