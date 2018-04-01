var express = require('express')
var axios   = require('axios')
var config = require('../../config')

var Character = require('../models/character')

var parseContent = require('../helper/parseContent')

var router = express.Router()




router.post('/roster', (req, res, next) => {
    if (!res.user || !res.user.Role.roster) {
        return res.sendStatus(403)
    }
    axios.get('https://eu.api.battle.net/wow/guild/Ashenvale/' + encodeURIComponent('Гномреганцы'), {
        params : {
            fields : 'members',
            locale : 'ru_RU',
            apikey : config.bnet.clientID,
        }
    })
    .then(response => {
        let chunks = [[]]
        let chunkNum = 0
        for (let character of response.data.members) {
            character.character.rank = character.rank
            chunks[chunkNum].push(character.character)
            if (chunks[chunkNum].length > 50) {
                chunkNum++
                chunks[chunkNum] = []
            }
        }

        let saveChunk = () => {
            Character.update(chunks[chunkNum], (character) => {
                console.log('saving chunk : ', chunkNum);
                chunkNum--
                if (chunkNum >= 0) {
                    saveChunk()
                } else {
                    res.sendStatus(200)
                }
            })
        }
        saveChunk()
    })
    .catch(error => {
        console.log(error);
    })
})

router.post('/:id', (req, res, next) => {
    if (!res.user) {
        return res.sendStatus(403)
    }
    Character.get({id:req.params.id}, (characters) => {
        if (!characters.length) {
            res.sendStatus(404)
        } else {
            let character = characters[0]
            if (res.user.id !== character.user) {
                res.sendStatus(403)
            } else {
                let lore = parseContent(req.body.lore_src, [])
                lore = lore ? '<p>' + lore + '</p>' : null
                Character.save(character, {
                    lore_src : req.body.lore_src,
                    lore     : lore,
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
