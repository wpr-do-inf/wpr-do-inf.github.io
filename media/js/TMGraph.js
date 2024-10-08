var TMGraph = (function () {
'use strict';

TMGraph = Object.makeSubclass();

function stateToGraphivz(desc) {
    var res = [];
    var id = desc['id'];
    var labels = {}; 

    desc['transitions'].forEach(function (trans) {
        var to_id = trans[2];
        var label = labels[ to_id ] || [];

        label.push( trans[0] + '/' + trans[1] + ',' + trans[3] );
        labels[to_id] = label;
    });

    var done = {};
    desc['transitions'].forEach(function (trans) {
        var to_id = trans[2];
        if (done[to_id] == undefined) {
            var label = ' [ label="' + labels[to_id].join('\\n') + '" id="edge_' + id + '_' + to_id + '" ]';
            res.push( id + ' -> ' + to_id + label + ';' );
            done[to_id] = true;
        }
    });
    return res.join('\n');
}

function isFinalState(desc) {
    var id = desc['id'];
    var result = true;

    desc['transitions'].forEach(function (trans) {
        var to_id = trans[2];
        if (to_id != id) {
            result = false;
        }
    });
    return result;
}

function tmToGraphviz (tm) {
    var program = tm.exportToMap();
    
    var states_desc = program['states'];
    var final_states = [];
    var non_final_states = [];
    for(var key in states_desc) {
        if (states_desc.hasOwnProperty(key)) {
            if( isFinalState(states_desc[key]) ) {
                final_states.push(key);
            } else {
                non_final_states.push(key);
            }
        }
    }

    var grapviz_src = 
    'digraph finite_state_machine { \n' +
    'rankdir=LR; \n' +
    'size="8,5"; \n' + 
    'node [shape = doublecircle]; ' + final_states.join(' ; ') + ';' +
    'node [shape = circle]; \n';
    for(var key in states_desc) {
        if (states_desc.hasOwnProperty(key)) {
            grapviz_src += key + ' [id="' + key + '"];\n';
        }
    }

    for(var key in states_desc) {
        if (states_desc.hasOwnProperty(key)) {
            grapviz_src += stateToGraphivz(states_desc[key]);
            grapviz_src += '\n';
        }
    }
    grapviz_src += '}';
    console.log(grapviz_src);
    return grapviz_src;
}

TMGraph.prototype._init = function (machine, wrapper_element) {
    this.machine_ = machine;
    this.wrapper_element_ = wrapper_element;
    this.is_initialized_ = false;
}

TMGraph.prototype.create = function () {
    this.state_to_node_ = {};
    var tm_graph_src = tmToGraphviz(this.machine_, this.state_to_node_);
    var svg_src = runGraphviz(tm_graph_src, "svg");
    if (svg_src != null) {
        $(this.wrapper_element_).html(svg_src);
        this.svg_ = $(this.wrapper_element_).find('svg:first');
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

TMGraph.prototype.highlightTransition = function (trans, curr_symbol, new_symbol) {
    if (!this.is_initialized_ || !trans) {
        return ;
    }
    if (this.prev_selector_) {
        this.svg_.find(this.prev_selector_).attr('fill', '#000000');
    }
    var edge_id = '#edge_'  + trans.from_.getId() + '_' + trans.to_.getId();
    var text = curr_symbol + '/' + new_symbol + ',' + trans.head_movement_;
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

return TMGraph;
})();

