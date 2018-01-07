var express = require('express')
var twig    = require('twig').twig
var fs      = require('fs')
var menu    = require('../helper/menu')

var tpl = {
    main : fs.readFileSync('./views/error.twig', 'utf8'),
}

function render(message, error)
{
    return twig({data: tpl.main}).render({
        error : error,
    });
};

function error(err, req, res, next) {
    return function error(err, req, res, next) {
        res.status(err.status || 500);
        var message = err.message;
        var error   = req.app.get('env') === 'development' ? err : {};
        res.render('layout', {
            title   : 'Гномреганцы. Расовая гильдия гномов на сервере Ясеневый Лес (EU)',
            caption : message,
            content : render(error),
            menu    : menu(null),
        });
    }
};

module.exports = error;
