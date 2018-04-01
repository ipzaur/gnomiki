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

function splitByGroup(characters)
{
    var result = []
    for (let i=0; characters[i]; i++) {
        let character = characters[i]
        if (!result[character.rank]) {
            result[character.rank] = []
        }
        result[character.rank].push(character)
    }
    return result
}

router.get('/', (req, res, next) => {
    Page.get({
        type : 'about',
        url  : 'about'
    }, (page) => {
        Character.get({}, (characters) => {
            console.log(res.user);
            let roster = splitByGroup(characters)
            res.render('layout', {
                menu    : menu('about'),
                title   : page.title + '. Расовая гильдия гномов на сервере Ясеневый Лес (EU)',
                caption : page.title,
                content : tpl.render({
                    user    : res.user,
                    caption : page.title,
                    text    : page.text,
                    roster  : roster,
                }),
            })
        })
    });
})

module.exports = router;
