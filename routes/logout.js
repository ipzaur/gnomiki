var express = require('express')
var config = require('../../config')

var User      = require('../models/user')
var Session   = require('../models/session')
var Character = require('../models/character')

var router = express.Router()

router.get('/', (req, res, next) => {
    res.clearCookie('sessionId')
    Session.remove(res.session, () => {
        res.redirect('/')
    })
})

module.exports = router;
