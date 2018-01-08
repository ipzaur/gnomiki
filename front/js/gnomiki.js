var $ = require('jquery')

var menu = require('./menu')

var characters = require('./characters')
var news = require('./news')

$(document).ready(() => {
    menu()

    characters()
    news()
})
