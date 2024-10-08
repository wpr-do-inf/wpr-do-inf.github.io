var TMGraph;

(function () {
    'use strict';

    TMGraph = function(wrapper_element) {
        this.wrapper_element = wrapper_element;
        this.is_initialized_ = false;

        var self = this;

        UI.on(UI.TM_CURRENT_STATE_CHANGED, function (state, next_action) {
            self.highlightState(state);
            self.highlightTransition(next_action);
        });

    }


function stateToGraphviz(state_id) {
    var res = [];
    var labels = {};

    TMSim.get_state_actions(state_id).forEach( function (action) {
        var to_id = action.next_state;
        if (to_id != '-') {
            var label = labels[ to_id ] || [];

            label.push( action.symbol + '/' + action.new_symbol + ',' + action.move );
            labels[to_id] = label;
        }
    } );

    var done = {};
    TMSim.get_state_actions(state_id).forEach( function (action) {
        var to_id = action.next_state;
        if (to_id != '-' && done[to_id] == undefined) {
            var label = ' [ label="' + labels[to_id].join('\\n') + '" id="edge_' + state_id + '_' + to_id + '" ]';
            res.push( state_id + ' -> ' + to_id + label + ';' );
            done[to_id] = true;
        }
    });
    return res.join('\n');
}


function tmToGraphviz (tm) {
    var final_states = [];
    var non_final_states = [];

    TMSim.get_states().forEach( function(state_id) {
        if (TMSim.is_final_state(state_id)) {
            final_states.push(state_id);
        } else {
            non_final_states.push(state_id);
        }
    } );

    var graphviz_src =
    'digraph finite_state_machine { \n' +
    'rankdir=LR; \n' +
    'size="8,5"; \n' +
    'node [shape = doublecircle]; ' + final_states.join(' ; ') + ';' +
    'node [shape = circle]; \n';

    TMSim.get_states().forEach( function(state_id) {
        graphviz_src += state_id + ' [id="' + state_id + '"];\n';
    } );

    TMSim.get_states().forEach( function(state_id) {
        graphviz_src += stateToGraphviz(state_id);
        graphviz_src += '\n';
    } );

    graphviz_src += '}';
    /*console.log(graphviz_src);*/
    return graphviz_src;
}


TMGraph.prototype.create = function () {
    this.state_to_node_ = {};
    var tm_graph_src = tmToGraphviz();
    var svg_src = runGraphviz(tm_graph_src, "svg");
    if (svg_src != null) {
        $(this.wrapper_element).html(svg_src);
        this.svg_ = $(this.wrapper_element).find('svg:first');
        this.is_initialized_ = true;
    }
}

TMGraph.prototype.highlightState = function (state_id) {
    if (!this.is_initialized_) {
        return ;
    }
    if (this.highlighted_) {
        this.svg_.find('#' +  this.highlighted_ + ' > ellipse:first').attr('fill', '#ffffff');
    }
    this.svg_.find('#' +  state_id + ' > ellipse:first').attr('fill', '#aaffaa');
    this.highlighted_ = state_id;
}

TMGraph.prototype.highlightTransition = function (action) {
    if (!this.is_initialized_ || !action) {
        return ;
    }
    if (this.prev_selector_) {
        this.svg_.find(this.prev_selector_).attr('fill', '#000000');
    }
    var edge_id = '#edge_'  + action.state + '_' + action.next_state;
    var text = action.symbol + '/' + action.new_symbol + ',' + action.move;
    var selector = edge_id + ' > text:contains(' + text + ')';
    this.svg_.find(selector).attr('fill', '#ff0000');
    this.prev_selector_ = selector;
}

function runGraphviz(graph_src, format) {
    var result;
    try {
        result = Viz(graph_src, format);
        if (format === "svg")
            return result;
        else
            return null;
    } catch(e) {
        return console.log(e.toString());
    }
}

})();
