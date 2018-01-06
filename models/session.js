'use strict'

var mysql = require('mysql');
var config = require('../../config')

var cache = []
var fields = [
    'id',
    'user',
    'created',
]

function grab(params)
{
    let result = null
    for (let i=0; cache[i]; i++) {
        let session = cache[i]
        if (params.id && params.id == session.id) {
            result = session
            break
        }
    }
    return result;
};

function save(session, params, callback)
{
    let isUpdate = true
    if (session !== null) {
        session = grab(session)
    }
    if (session === null) {
        params = {
            id   : params.id,
            user : params.userId || null,
        }
        session = params
        isUpdate = false
    }
    let save = []
    for (let param in params) if (params.hasOwnProperty(param)) {
        if (params[param] === null) {
            save.push(param + '=NULL')
        } else {
            save.push(param + '="' + params[param] + '"')
        }
    }
    var connection = mysql.createConnection(config.mysql);
    connection.connect();
    if (!isUpdate) {
        let query = 'INSERT INTO session SET ' + save.join(', ')
        connection.query(query, function(err, result) {
            if (err) throw err;
            cache.push(session);
            callback(session);
        });
    } else {
        let where = []
        for (let param in session) if (session.hasOwnProperty(param)) {
            if (session[param] === null) {
                where.push(param + ' IS NULL')
            } else {
                where.push(param + '="' + session[param] + '"')
            }
        }
        let query = 'UPDATE session SET ' + save.join(', ') + ' WHERE ' + where.join(' AND ')
        connection.query(query, function(err, result) {
            if (err) throw err;
            Object.assign(session, params)
            callback(session);
        });
    }
    connection.end();
}

function get(params, callback)
{
    if (!cache.length) {
        var connection = mysql.createConnection(config.mysql);
        connection.connect();
        connection.query('SELECT * FROM session', function(err, rows, fields) {
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

exports.get  = get;
exports.save = save;