'use strict'

var mysql = require('mysql');
var config = require('../../config')

var cache = [];
var fields = [
    'id',
    'name',
    'roaster',
    'news',
]

function grab(params)
{
    let result = null
    for (let i=0; cache[i]; i++) {
        let role = cache[i]
        if (params.id && params.id != role.id) continue
        return role
    }
    return result;
};

function get(params, callback)
{
    if (!cache.length) {
        var connection = mysql.createConnection(config.mysql);
        connection.connect();
        connection.query('SELECT * FROM `role`', function(err, rows, fields) {
            if (err) throw err;
            cache = JSON.parse(JSON.stringify(rows))
            callback(grab(params));
        });
        connection.end();
    } else {
        callback(grab(params));
    }

    return true;
}

exports.get    = get;
