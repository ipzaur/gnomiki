var express = require('express')
var twig    = require('twig').twig
var fs      = require('fs')
var menu    = require('../helper/menu')
var Page    = require('../models/page')

var router = express.Router();

var tpl = twig({data : fs.readFileSync('./views/pve.twig', 'utf8')})

router.get('/', (req, res, next) => {
    Page.get({
        type : 'pve',
        url  : 'pve'
    }, (page) => {
        res.render('layout', {
            menu    : menu('pve'),
            title   : page.title + '. Расовая гильдия гномов на сервере Ясеневый Лес (EU)',
            caption : page.title,
            content : tpl.render({
                caption : page.title,
                text    : page.text
            }),
        })
    });
})

module.exports = router;
