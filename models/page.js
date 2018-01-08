'use strict'

var mysql = require('mysql')
var config = require('../../config')

var cache = null;

function grab(params)
{
    if (params.url) {
        for (let i=0; cache[params.type][i]; i++) {
            if (cache[params.type][i].url == params.url) {
                return cache[params.type][i];
            }
        }
    } else {
        return cache[params.type];
    }
};

function get(params, callback)
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
            callback(grab(params));
        });
        connection.end();
    } else {
        callback(grab(params));
    }

    return true;
}

exports.get = get;
