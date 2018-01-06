'use strict'

var mysql = require('mysql');
var config = require('../../config')

var Character = require('./character')
var Role = require('./role')

var cache = []
var fields = [
    'id',
    'role',
    'bid',
    'btag',
    'character',
]

function grab(params)
{
    let result = null
    for (let i=0; cache[i]; i++) {
        let user = cache[i]

        if (params.id && params.id != user.id) continue
        if (params.bid && params.bid != user.bid) continue

        result = user
        break
    }
    return result;
};

function save(user, params, callback)
{
    if (user !== null) {
        user = grab(user)
    }
    let save = []
    for (let param in params) if (params.hasOwnProperty(param)) {
        if (params[param] === null) {
            save.push('`' + param + '`=NULL')
        } else {
            save.push('`' + param + '`="' + params[param] + '"')
        }
    }
    let connection = mysql.createConnection(config.mysql);
    connection.connect();
    if (user === null) {
        let query = 'INSERT INTO `user` SET ' + save.join(', ')
        connection.query(query, function(err, result) {
            if (err) throw err;
            let connection = mysql.createConnection(config.mysql);
            let query = 'SELECT * FROM `user` WHERE `id`=' + result.insertId
            connection.query(query, function(err, rows, fields) {
                if (err) throw err;
                user = JSON.parse(JSON.stringify(rows))[0]
                cache.push(user);
                callback(grab(user));
            });
            connection.end()
        });
    } else {
        let where = []
        for (let param in user) if (user.hasOwnProperty(param)) {
            if (user[param] === null) {
                where.push('`' + param + '` IS NULL')
            } else {
                where.push('`' + param + '`="' + user[param] + '"')
            }
        }
        let query = 'UPDATE `user` SET ' + save.join(', ') + ' WHERE ' + where.join(' AND ')
        connection.query(query, function(err, result) {
            if (err) throw err;
            Object.assign(user, params)
            callback(user);
        });
    }
    connection.end();
}

function get(params, callback)
{
    let after = (user) => {
        if (user !== null && user.character !== null) {
            Character.get({id:user.character}, (characters) => {
                user.Character = characters[0]
                Role.get({id:user.role}, (role) => {
                    user.Role = role
                    callback(user)
                })
            })
        } else {
            callback(user)
        }
    }

    if (!cache.length) {
        var connection = mysql.createConnection(config.mysql);
        connection.connect();
        connection.query('SELECT * FROM `user`', function(err, rows, fields) {
            if (err) throw err;
            cache = JSON.parse(JSON.stringify(rows))
            after(grab(params))
        });
        connection.end();
    } else {
        after(grab(params))
    }

    return true;
}

exports.get  = get;
exports.save = save;