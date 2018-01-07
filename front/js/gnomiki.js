var $ = require('jquery')
var menu = require('./menu')
var profile = require('./profile')
var characters = require('./characters')

$(document).ready(() => {
    menu()
    characters()
    profile()
})
