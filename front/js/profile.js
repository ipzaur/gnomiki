var $ = require('jquery')

var $main = null

var events = {
    click : (ev) => {
        let $el = $(ev.target)
        if ($el.is('[profile-action="update"]')) {
            update()
        }
    }
}

function update() {
    console.log('update');
}

function init()
{
    $main = $('#profile')
    if (!$main.length) {
        $main = null
        return false
    }
    $(window).on(events);
}

module.exports = init