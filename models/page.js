'use strict'

var mysql = require('mysql')
var config = require('../../config')

var cache = null;

function grab(_params)
{
    if (_params.url) {
        for (let i=0; cache[_params.type][i]; i++) {
            if (cache[_params.type][i].url == _params.url) {
                return cache[_params.type][i];
            }
        }
    } else {
        return cache[_params.type];
    }
};

function get(_params, callback)
{
    if (cache === null) {
        var connection = mysql.createConnection(config.mysql);
        connection.connect();
        connection.query('SELECT * FROM page WHERE hidden=0', function(err, rows, fields) {
            if (err) throw err;
            cache = {};
            for (var i=0; rows[i]; i++) {
                let type = rows[i].type;
                if (!cache[type]) {
                    cache[type] = [];
                }
                rows[i].date = rows[i].created.split('-').reverse().join('.');
                cache[type].push(rows[i]);
            }
            callback(grab(_params));
        });
        connection.end();
    } else {
        callback(grab(_params));
    }

    return true;
}

exports.get = get;
