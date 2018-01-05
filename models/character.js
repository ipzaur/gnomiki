'use strict'

var mysql = require('mysql');
var config = require('../../config')

var cache = [];
var fields = [
    'id',
    'name',
    'gender',
    'class',
    'level',
    'thumbnail',
    'rank',
    'user'
]

function grab(params)
{
    let result = []
    for (let i=0; cache[i]; i++) {
        let character = cache[i]

        if (params.id && params.id != character.id) continue
        if (params.user && params.user != character.user) continue
        if (params.name && params.name != character.name) continue
        if (params.level && params.level != character.level) continue

        result.push(character)
    }
    return result;
};

function save(character, params, callback)
{
    if (character !== null) {
        character = grab(character)
        if (!character.length) {
            character = null
        } else {
            character = character[0]
        }
    }
    let save = []
    for (let param in params) if (params.hasOwnProperty(param)) {
        if (fields.indexOf(param) < 0) continue
        if (params[param] === null) {
            save.push('`' + param + '`=NULL')
        } else {
            save.push('`' + param + '`="' + params[param] + '"')
        }
    }
    let connection = mysql.createConnection(config.mysql);
    connection.connect();
    if (character === null) {
        let query = 'INSERT INTO `character` SET ' + save.join(', ')
        connection.query(query, function(err, result) {
            if (err) throw err;
            let connection = mysql.createConnection(config.mysql);
            let query = 'SELECT * FROM `character` WHERE `id`=' + result.insertId
            connection.query(query, function(err, rows, fields) {
                if (err) throw err;
                character = JSON.parse(JSON.stringify(rows))[0]
                cache.push(character);
                callback(grab(character)[0]);
            });
            connection.end()
        });
    } else {
        let where = []
        for (let param in character) if (character.hasOwnProperty(param)) {
            if (fields.indexOf(param) < 0) continue
            if (character[param] === null) {
                where.push('`' + param + '` IS NULL')
            } else {
                where.push('`' + param + '`="' + character[param] + '"')
            }
        }
        let query = 'UPDATE `character` SET ' + save.join(', ') + ' WHERE ' + where.join(' AND ')
        connection.query(query, function(err, result) {
            if (err) throw err;
            Object.assign(character, params)
            callback(character);
        });
    }
    connection.end();
}

function filter(BNetList, params)
{
    var result = []
    for (let i=0; BNetList[i]; i++) {
        let character = BNetList[i]

        if (params.realm && params.realm != character.realm) continue
        if (params.guild && params.guild != character.guild) continue

        result.push(character)
    }
    return result
}

function get(params, callback)
{
    if (!cache.length) {
        var connection = mysql.createConnection(config.mysql);
        connection.connect();
        connection.query('SELECT * FROM `character`', function(err, rows, fields) {
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

function update(characters, callback)
{
    let count = characters.length
    if (!count) {
        return callback(null)
    }

    let saved = (character) => {
        count--
        if (!count) callback(character)
    }

    for (let i=0; characters[i]; i++) {
        get(characters[i], (character) => {
            if (character === null) {
                save(null, characters[i], (character) => {
                    saved(character)
                })
            } else {
                save(character, characters[i], (character) => {
                    saved(character)
                })
            }
        })
    }
}

exports.get    = get;
exports.save   = save;
exports.filter = filter;
exports.update = update;