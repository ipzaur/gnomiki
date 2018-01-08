var express   = require('express')
var twig      = require('twig').twig
var fs        = require('fs')
var menu      = require('../helper/menu')
var Character = require('../models/character')
var User      = require('../models/user')

var router = express.Router()
var tpl = {
    main : twig({
        allowInlineIncludes: true,
        data: fs.readFileSync('./views/profile.twig', 'utf8'),
    }),
}

function render(characters, current)
{
    return tpl.main.render({
        caption    : 'Мои персонажи',
        characters : characters,
        current    : current,
    });
};

router.post('/character/:id', (req, res, next) => {
    if (!res.user) {
        return res.sendStatus(403)
    }
    if (!req.params.id) {
        return res.sendStatus(403)
    }
    Character.get({
        user : res.user.id,
    }, (characters) => {
        for (let i=0; characters[i]; i++) {
            if (characters[i].id == req.params.id) {
                User.save(res.user, {character:characters[i].id}, (user) => {
                    res.user = user
                    res.sendStatus(200)
                })
                return true
            }
        }
        res.sendStatus(403)
    })
});

router.get('/', (req, res, next) => {
    if (!res.user) {
        res.sendStatus(403)
    }
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
