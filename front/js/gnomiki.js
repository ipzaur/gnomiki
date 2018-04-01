var $ = require('jquery')

var menu = require('./menu')

var characters = require('./characters')
var news = require('./news')
var gallery = require('./gallery')

$(document).ready(() => {
    menu()

    characters()
    news()
    gallery()
})
