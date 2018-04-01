'use strict'

var mysql = require('mysql');
var config = require('../../config')

const DEFAULT = {
    perPage : 5
}
var cache = [];
var fields = [
    'id',
    'title',
    'content',
    'content_src',
]
var skipGetFields = [
    'title',
    'content',
    'content_src',
    'created',
    'hidden',
]

function maxPage(perPage)
{
    perPage = perPage || DEFAULT.perPage;
    return Math.ceil(cache.length / perPage);
}

function extend(news)
{
    news.date = news.created.split(' ')[0].split('-').reverse().join('.')
    return news
}

function grab(params, remove)
{
    if (params.id) {
        let result = null
        for (let i=0; cache[i]; i++) {
            let news = cache[i]
            if (news.id == params.id) {
                if (remove === true) {
                    cache.splice(i, 1)
                    break
                }
                cache[i] = extend(news)
                result = news
                break
            }
        }
        return result
    } else {
        let result  = [],
            perPage = params.perPage || DEFAULT.perPage,
            page    = params.page || 1,
            startI  = (page - 1) * perPage,
            endI    = Math.min(startI+perPage, cache.length-1);
        for (let i=startI; i<endI; i++) {
            cache[i] = extend(cache[i])
            result.push(cache[i]);
        }
        return result;
    }
};

function get(params, callback)
{
    if (!cache.length) {
        var connection = mysql.createConnection(config.mysql);
        connection.connect();
        connection.query('SELECT * FROM news ORDER BY id DESC', function(err, rows, fields) {
            if (err) throw err;
            cache = JSON.parse(JSON.stringify(rows));
            callback(grab(params));
        });
        connection.end();
    } else {
        callback(grab(params));
    }

    return true;
}

function save(news, params, callback)
{
    if (news !== null) {
        news = grab(news)
    }
    let save = []
    for (let param in params) if (params.hasOwnProperty(param)) {
        if (fields.indexOf(param) < 0) continue
        if ( (param == 'content' || param == 'content_src') && !params[param]) {
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
    if (news === null) {
        let query = 'INSERT INTO `news` SET ' + save.join(', ')
        connection.query(query, function(err, result) {
            if (err) throw err;
            let connection = mysql.createConnection(config.mysql);
            let query = 'SELECT * FROM `news` WHERE `id`=' + result.insertId
            connection.query(query, function(err, rows, fields) {
                if (err) throw err;
                news = JSON.parse(JSON.stringify(rows))[0]
                cache.unshift(news);
                callback(grab(news));
            });
            connection.end()
        });
    } else {
        let where = []
        for (let param in news) if (news.hasOwnProperty(param)) {
            if (fields.indexOf(param) < 0 || skipGetFields.indexOf(param) >= 0) continue
            if (news[param] === null) {
                where.push('`' + param + '` IS NULL')
            } else {
                where.push('`' + param + '`=' + mysql.escape(news[param]))
            }
        }
        let query = 'UPDATE `news` SET ' + save.join(', ') + ' WHERE ' + where.join(' AND ')
        connection.query(query, function(err, result) {
            if (err) throw err;
            Object.assign(news, params)
            callback(news);
        });
    }
    connection.end();
}

function remove(params, callback)
{
    if (cache.length) {
        var connection = mysql.createConnection(config.mysql)
        connection.connect()
        connection.query('DELETE FROM `news` WHERE `id`=' + params.id, function(err, result) {
            if (err) throw err
            grab(params, true)
            callback()
        })
        connection.end()
    } else {
        callback()
    }

    return true
}

exports.get = get;
exports.save = save;
exports.remove = remove;
exports.maxPage = maxPage;