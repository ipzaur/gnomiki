var express = require('express')
var twig    = require('twig').twig
var fs      = require('fs')
var menu    = require('./menu')
var page    = require('../models/page')

var router = express.Router();

var render = {
    main: (pageInfo, list) => {
        let tpl = fs.readFileSync('./views/stories.twig', 'utf8')
        return twig({data: tpl}).render({
            caption   : pageInfo.title,
            text      : pageInfo.text,
            stories   : list
        })
    },
    story: (story) => {
        let tpl = fs.readFileSync('./views/story.twig', 'utf8')
        return twig({data: tpl}).render({
            caption : story.title,
            text    : story.source
        })
    },
}


router.get('/:story', (req, res, next) => {
    var storyLabel = req.params.story
    page.get({
        type : 'story',
        url  : storyLabel
    }, (story) => {
        if (!story) {
            res.status(404)
     //       let e404 = require('./e404.js');
       //     callback(e404.action());
        } else {
            res.render('layout', {
                title   : story.title + '. Расовая гильдия гномов на сервере Ясеневый Лес (EU)',
                caption : 'Гномреганские новости',
                content : render.story(story),
                menu    : menu('stories'),
            })
        }
    });
})

router.get('/', (req, res, next) => {
    page.get({
        type : 'stories',
        url  : 'stories'
    }, (pageInfo) => {
        page.get({
            type : 'story'
        }, (list) => {
            res.render('layout', {
                title   : pageInfo.title + '. Расовая гильдия гномов на сервере Ясеневый Лес (EU)',
                caption : 'Гномреганские новости',
                content : render.main(pageInfo, list),
                menu    : menu('stories'),
            })
        });
    });
})

module.exports = router;
