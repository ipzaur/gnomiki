var express = require('express')
var axios   = require('axios')
var passport = require('passport');
var BnetStrategy = require('passport-bnet').Strategy;
var config = require('../../config')

var User      = require('../models/user')
var Session   = require('../models/session')
var Character = require('../models/character')

var router = express.Router()

// Use the BnetStrategy within Passport. 
passport.use(new BnetStrategy({
    clientID: config.bnet.clientID,
    clientSecret: config.bnet.clientSecret,
    region:'eu',
    scope:'wow.profile profile',
    callbackURL: "https://gnomiki.ru/auth/callback",
}, function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

function afterAuth(res, user)
{
    res.user = user
    Session.save(res.session, {user:res.user.id}, (session) => {
        res.session = session
        res.redirect('/stories/')
    })
}

function createNewuser(req, res)
{
    User.save(null, {
        bid  : req.user.id,
        btag : req.user.battletag,
        role : 1,
    }, (user) => {
        updateCharacters(req, res, user)
    })
}

function updateCharacters(req, res, user)
{
    axios.get('https://eu.api.battle.net/wow/user/characters?access_token=' + req.user.token)
    .then(response => {
        let characters = Character.filter(response.data.characters, {
            realm : 'Ashenvale',
            guild : 'Гномреганцы',
        })
        for (let i=0; characters[i]; i++) {
            characters[i].user = user.id
        }
        Character.update(characters, (character) => {
            if (!user.character && character !== null) {
                User.save(user, {character:character.id}, (user) => {
                    afterAuth(res, user)
                })
            } else {
                afterAuth(res, user)
            }
        })
    })
    .catch(error => {
        console.log(error);
    })
}

router.get('/callback', 
    passport.authenticate('bnet', { failureRedirect: '/' }),
    function(req, res) {
        User.get({bid : req.user.id}, (user) => {
            if (user === null) {
                createNewuser(req, res)
            } else {
                updateCharacters(req, res, user)
            }            
        })
    }
)

router.get('/', passport.authenticate('bnet'))

module.exports = router;
