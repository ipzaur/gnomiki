'use strict'

var mysql = require('mysql');
var config = require('../../config')

var cache = [];
const DEFAULT = {
    perPage : 5
}

function maxPage(_perPage)
{
    _perPage = _perPage || DEFAULT.perPage;
    return Math.ceil(cache.length / _perPage);
}

function grab(_params)
{
    let result  = [],
        perPage = _params.perPage || DEFAULT.perPage,
        page    = _params.page || 1,
        startI  = (page - 1) * perPage,
        endI    = Math.min(startI+perPage, cache.length-1);
    for (let i=startI; i<endI; i++) {
        result.push(cache[i]);
    }
    return result;
};

function get(_params, callback)
{
    if (!cache.length) {
        var connection = mysql.createConnection(config.mysql);
        connection.connect();
        connection.query('SELECT * FROM news', function(err, rows, fields) {
            if (err) throw err;
            for (var i=0; rows[i]; i++) {
                rows[i].date = rows[i].created.split('-').reverse().join('.');
            }
            cache = rows;
            callback(grab(_params));
        });
        connection.end();
    } else {
        callback(grab(_params));
    }

    return true;
}

exports.get = get;
exports.maxPage = maxPage;