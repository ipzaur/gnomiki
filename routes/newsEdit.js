var express = require('express')

var News = require('../models/news')

var parseContent = require('../helper/parseContent')

var router = express.Router()

router.post('/:id', (req, res, next) => {
    if (!res.user || !res.user.Role.news) {
        return res.sendStatus(403)
    }
    let params = {
        title       : req.body.title,
        content_src : req.body.content_src,
        content     : parseContent(req.body.content_src),
    }
    if (req.params.id == 0) {
        News.save(null, params, (news) => {
            res.json(news)
        })
    } else {
        News.get({id:req.params.id}, (news) => {
            if (news === null) {
                res.sendStatus(404)
            } else {
                News.save(news, params, (news) => {
                    res.json(news)
                })
            }
        })
    }
})

router.delete('/:id', (req, res, next) => {
    if (!res.user || !res.user.Role.news) {
        return res.sendStatus(403)
    }
    if (req.params.id == 0) {
        return res.sendStatus(404)
    }

    News.remove({id:req.params.id}, () => {
        res.sendStatus(200)
    })
})

router.get('/:id', (req, res, next) => {
    if (!res.user || !res.user.Role.news) {
        return res.sendStatus(403)
    }
    News.get({
        id : req.params.id,
    }, (news) => {
        res.json(news)
    })
});

module.exports = router;
