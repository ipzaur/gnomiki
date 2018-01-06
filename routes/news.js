var express = require('express')
var twig    = require('twig').twig
var fs      = require('fs')
var menu    = require('./menu')
var news    = require('../models/news')

var router = express.Router()
var tpl = {
    main      : fs.readFileSync('./views/news.twig', 'utf8'),
    paginator : fs.readFileSync('./views/paginator.twig', 'utf8'),
}

function render(newsList, page, canEdit)
{
    return twig({data: tpl.main}).render({
        caption   : 'Гномреганские новости',
        news      : newsList,
        canEdit   : canEdit,
        paginator : twig({data: tpl.paginator}).render({
            link  : '/',
            pages : news.maxPage(),
            cur   : page,
        })
    });
};

router.get('/(:page|)', (req, res, next) => {
    var page = req.params.page || 1
    news.get({
        page : page,
    }, (list) => {
        res.render('layout', {
            title   : 'Гномреганцы. Расовая гильдия гномов на сервере Ясеневый Лес (EU)',
            caption : 'Гномреганские новости',
            content : render(list, page, (res.user && res.user.Role.news) ),
            menu    : menu('news'),
        })
    })
});

module.exports = router;
