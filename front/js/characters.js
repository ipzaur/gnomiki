var $ = require('jquery')

var $main = null

var events = {
    click : (ev) => {
        let $el = $(ev.target)
        if ($el.is('[character-action="select"]')) {
            select($el.closest('[character-elem="main"]'))
        }
    }
}

function select($character) {
    if ($character.is('._cur')) {
        return false
    }

    $.ajax({
        type     : 'POST',
        url      : '/profile/character/' + $character.attr('character-id'),
        dataType : 'json',
        xhrFields: {
            withCredentials: true
        },
        statusCode : {
            200 : function(xhr) {
                window.location.reload()
            }
        }
    });
}

function init()
{
    $main = $('#characters')
    if (!$main.length) {
        $main = null
        return false
    }
    $(window).on(events);
}

module.exports = init