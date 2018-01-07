var $ = require('jquery')

var $profile = null

var events = {
    click : (ev) => {
        let $el = $(ev.target)
        if ($el.closest('[menu-action="profile"]').length) {
            toggle()
        }
    }
}

function toggle() {
    $profile.toggleClass('h')
}

function init()
{
    $profile = $('[menu-elem="profile"]')
    $(window).on(events);
}

module.exports = init