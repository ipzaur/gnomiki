var express   = require('express')
var twig      = require('twig').twig
var fs        = require('fs')
var menu      = require('./menu')
var Character = require('../models/character')

var router = express.Router()
var tpl = {
    main : fs.readFileSync('./views/profile.twig', 'utf8'),
}

function render(characters, current)
{
    return twig({data: tpl.main}).render({
        caption    : 'Мои персонажи',
        characters : characters,
        current    : current,
    });
};

router.get('/', (req, res, next) => {
    Character.get({
        user : res.user.id,
    }, (characters) => {
        res.render('layout', {
            title   : 'Мои персонажи. Расовая гильдия гномов на сервере Ясеневый Лес (EU)',
            content : render(characters, res.user.character),
            menu    : menu('profile'),
        })
    })
});

module.exports = router;
