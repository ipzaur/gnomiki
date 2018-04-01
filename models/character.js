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
    'user',
    'lore',
    'lore_src',
    'inguild',
]
var skipGetFields = [
    'lore',
    'lore_src',
    'inguild',
]

var classAlias = {
    1  : ['Воин', 'Воин'],
    3  : ['Охотник', 'Охотница'],
    4  : ['Разбойник', 'Разбойница'],
    5  : ['Жрец', 'Жрица'],
    6  : ['Рыцарь смерти', 'Рыцарь смерти'],
    8  : ['Маг', 'Магичка'],
    9  : ['Чернокнижник', 'Чернокнижница'],
    10 : ['Монах', 'Монахиня'],
}

function grab(params)
{
    let result = []
    for (let i=0; cache[i]; i++) {
        let character = cache[i]

        if (params.id && params.id != character.id) continue
        if (params.user && params.user != character.user) continue
        if (params.name && params.name != character.name) continue
        if (params.level && params.level != character.level) continue

        if (!character.classname) {
            character.classname = classAlias[character.class][character.gender]
        }
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
        if ( (param == 'lore' || param == 'lore_src') && !params[param]) {
            params[param] = null
        }
        if (params[param] === null) {
            save.push('`' + param + '`=NULL')
        } else {
            save.push('`' + param + '`=' + mysql.escape(params[param]))
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
            if (fields.indexOf(param) < 0 || skipGetFields.indexOf(param) >= 0) continue
            if (character[param] === null) {
                where.push('`' + param + '` IS NULL')
            } else {
                where.push('`' + param + '`=' + mysql.escape(character[param]))
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
        connection.query('SELECT * FROM `character` ORDER BY name', function(err, rows, fields) {
            if (err) throw err;
            if (!cache.length) {
                cache = JSON.parse(JSON.stringify(rows))
            }
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
        let params = {
            name : characters[i].name
        }
        get(params, (character) => {
            if (!character.length) {
                save(null, characters[i], (character) => {
                    saved(character)
                })
            } else {
                character = character[0]
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