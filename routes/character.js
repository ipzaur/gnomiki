var express = require('express')
var config = require('../../config')

var Character = require('../models/character')

var parseContent = require('../helper/parseContent')

var router = express.Router()

router.post('/:id', (req, res, next) => {
    if (!res.user) {
        res.sendStatus(403)
    }
    console.log(req.params)
    console.log(req.body);
    console.log(res.user);
    Character.get({id:req.params.id}, (characters) => {
        if (!characters.length) {
            res.sendStatus(404)
        } else {
            let character = characters[0]
            if (res.user.id !== character.user) {
                res.sendStatus(403)
            } else {
                Character.save(character, {
                    lore_src : req.body.lore_src,
                    lore     : parseContent(req.body.lore_src),
                }, (character) => {
                    res.json(character)
                })
            }
        }
    })
})

router.get('/:id', (req, res, next) => {
    Character.get({id:req.params.id}, (characters) => {
        if (!characters.length) {
            res.sendStatus(404)
        } else {
            res.json(characters[0])
        }
    })
})

module.exports = router;
