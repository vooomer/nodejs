'use strict';

// module: mysql wrapper

var mysql = require('mysql');
var typo = require('./typo');

module.exports = function(options) {
    return new Connection(options);
};

function Connection(options){
    this.options = options;
}


Connection.prototype = {
    _fail: function() {
         try{
            this.connection.end();
        }catch(e){};

        // set flag to `false`, we will reconnect the next time
        this.connected = false;
    },

    createConnection: function() {
        if(!this.connected){
            this.connected = true;

            this.connection = mysql.createConnection(this.options);
        }

        return this;
    },

    // never run `connect` and `end` method in an application of high concurrence
    // [ref](http://stackoverflow.com/questions/14087924/cannot-enqueue-handshake-after-invoking-quit)

    // Error: Cannot enqueue Handshake after already enqueuing a Handshake.
    //     at Protocol._validateEnqueue (/Users/Kael/Codes/Framework/neocortex/node_modules/mysql/lib/protocol/Protocol.js:126:16)
    //     at Protocol._enqueue (/Users/Kael/Codes/Framework/neocortex/node_modules/mysql/lib/protocol/Protocol.js:89:13)
    //     at Protocol.handshake (/Users/Kael/Codes/Framework/neocortex/node_modules/mysql/lib/protocol/Protocol.js:42:41)
    connect: function() {
        return this;
    },

    end: function() {
        this.connection.end();
        return this;
    },

    query: function(sql, values, callback) {
        typo.TIME_ZONE = this.options.timezone;

        // query, callback
        if(typeof values === 'function'){
            callback = values;

            // the assignment of `sql` in strict mode will not affect arguments
            sql = typo.template(sql);

        // query, {}, callback
        }else{
            sql = typo.template(sql, values);
        }

        // if connection failed or has not started, create new connection
        this.createConnection();

        try {
            // overload arguments before .query method
            this.connection.query(sql, callback);
        } catch(e) {
            this._fail();

            // use try-catch to prevent from program exiting caused by mysql
            origin_callback(e);
        }

        return this;
    }
};

