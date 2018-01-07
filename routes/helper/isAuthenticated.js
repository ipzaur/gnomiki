var express = require('express')

var Session = require('../../models/session')
var User    = require('../../models/user')

function isAuthenticated(req, res, next) {
    let sessionId = req.cookies.sessionId
    if (!sessionId) {
        sessionId = (new Date).getTime() + Math.floor(Math.random()*100)
        res.cookie('sessionId', sessionId, {expires: new Date(Date.now() + 3600*24*30*5*1000)}) // 5 monthes
        Session.save(null, {id:sessionId}, (session) => {
            res.session = session
            res.user = null
            res.locals.user = res.user
            next()
        })
    } else {
        Session.get({id:sessionId}, (session) => {
            res.session = session
            if (res.session.user !== null) {
                User.get({id : res.session.user}, (user) => {
                    res.user = user
                    res.locals.user = res.user
                    next()
                })
            } else {
                res.user = null
                res.locals.user = res.user
                next()
            }
        })
    }
}

module.exports = isAuthenticated;
