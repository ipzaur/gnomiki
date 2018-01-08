var express   = require('express')
var twig      = require('twig').twig
var fs        = require('fs')
var menu      = require('../helper/menu')

var Character = require('../models/character')
var Page      = require('../models/page')

var router = express.Router();

var tpl = twig({
    allowInlineIncludes: true,
    data : fs.readFileSync('./views/about.twig', 'utf8'),
})

router.get('/', (req, res, next) => {
    Page.get({
        type : 'about',
        url  : 'about'
    }, (page) => {
        Character.get({}, (characters) => {
            let roster = characters
            res.render('layout', {
                menu    : menu('about'),
                title   : page.title + '. Расовая гильдия гномов на сервере Ясеневый Лес (EU)',
                caption : page.title,
                content : tpl.render({
                    caption : page.title,
                    text    : page.text,
                    roster  : roster,
                }),
            })
        })
    });
})

module.exports = router;
