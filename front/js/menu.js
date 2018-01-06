var $ = require('jquery')

var $profile = null

var events = {
    click : (ev) => {
        let $el = $(ev.target)
        if ($el.closest('[menu-action="profile"]')) {
            toggle()
        }
    }
}

function toggle() {
    $toggler.toggleClass('h')
}

function init()
{
    $toggler = $('[menu-elem="profile"]')
    $(window).on(events);
}

module.exports = init