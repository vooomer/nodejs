'use strict';

var typo = module.exports = require('typo')();
var mysql_escape = require('mysql').escape;

var REGEX_IS_OR = /^or$/i;


// @param {Object|string} value
// @param {string} prefix
// @param {string} joiner
// @param {boolean} escape_default
function join_object (value, prefix, joiner, escape_default) {
    return prefix + ' ' + Object.keys(value).map(function(key) {
        return key + ' = ' + escape( value[key], escape_default );
    
    }).join(joiner);
}

// @param {Object|string} value
// @param {boolean} escape_default
function escape(value, escape_default){
    var to_escape = escape_default;

    if(Object(value) === value){
        if( 'escape' in value ){
            to_escape = value.escape;
        }

        value = value.value
    }

    return to_escape ?
        mysql_escape(value, false, typo.TIME_ZONE) :
        value;
}


var MYSQL_HELPERS = {

    // @param {Object} value
    // {a: 1, b: 2}
    // -> "WHERE a = '1' AND b = '2'"
    where: function(value) {
        var type = REGEX_IS_OR.test(this.data) ? ' OR ' : ' AND ';
        return join_object(value, 'WHERE', type, true);
    },

    // {a: 1, b: 2}
    // -> "SET a = '1', b = '2'"
    set: function(value) {
        return join_object(value, 'SET', ', ', true);
    },

    // {a: 1, b: 2}
    // -> "UPDATE a = '1', b = '2'"
    update: function(value) {
        return join_object(value, 'UPDATE', ', ', true);
    },

    // {{a: 1, b: 2}}
    // "(a, b) VALUES ('1', '2')"
    values: function(data) {
        var keys = Object.keys(data);
        var values = keys.map(function(key) {
            return escape(data[key], true);
        });

        return '(' + keys.join(', ') + ') VALUES (' + values.join(', ') + ')' 
    },

    // default to not escape
    // {'p.a': 'q.a'}
    // "ON p.a = a.a"
    on: function(value) {
        var type = REGEX_IS_OR.test(this.data) ? ' OR ' : ' AND '
        return join_object(value, 'ON', type, false);
    },

    // 1
    // -> '1'
    escape: function(value) {
        return escape( value, true );
    }
};

typo.register(MYSQL_HELPERS);

