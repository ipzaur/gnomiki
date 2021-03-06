var $      = require('jquery')
var twig   = require('twig').twig
var editor = require('./editor')

var $main  = null
var $lored = null
var $lore  = null

var cache = {}

var tpl = {
    lore : twig({data:
        '<div class="character_lore{{ not text ? " _empty" }}"{% if editable %} character-action="edit"{% endif %}>' +
            '{% if text %}' +
                '{{ text }}' +
            '{% else %}'+
                '{{ empty }}' +
            '{% endif %}' +
        '</div>'}),
    empty : twig({data:
        '<p class="character_text">' +
            'У этого персонажа пока ещё нет истории. ' +
            '{% if editable %}' +
                '<br>Но можно написать её, просто щёлкнув по этому полю ;)' +
            '{% endif%}' +
        '</p>'}),
}

var events = {
    click : (ev) => {
        let $el = $(ev.target)
        if ($el.is('[character-action]')) {
            let action = $el.attr('character-action')
            let $character = $el.closest('[character-elem="main"]')
            switch (action) {
                case 'select' : return select($character)
                case 'lore'   : return lore.show($character)
                case 'edit'   : return lore.edit($character)
            }
        } else if ($el.is('[characters-action="roster"]')) {
            updateRoster($el)
        }
    }
}

function updateRoster($button)
{
    if ($button.hasClass('_disabled')) {
        return false
    }
    $button.addClass('_disabled')
    $.ajax({
        type     : 'POST',
        url      : '/character/roster',
        dataType : 'json',
        xhrFields: {
            withCredentials: true
        },
        success  : function(json) {
            $button.removeClass('_disabled')
            window.location.reload()
        }
    });
}

function load(id)
{
    if (cache[id]) {
        return new Promise((resolve, reject) => {
            resolve(cache[id])
        })
    } else {
        return $.ajax({
            type     : 'GET',
            url      :  '/character/' + id,
            dataType : 'json',
            xhrFields: {
                withCredentials: true
            },
            success : (character) => {
                cache[id] = character
            }
        })
    }
}

var lore = {
    loading  : false,
    editable : false,
    edit : () => {
        if ($lore === null) return false
        if (!$lored.attr('character-editable')) return false

        $lore.empty().removeClass('_empty')
        editor.init(
            $lore,
            cache[+$lored.attr('character-id')].lore_src,
            {
                buttons  : [],
                onSave   : lore.save,
                onCancel : lore.cancel,
            }
        )
    },
    show : ($character) => {
        if (lore.loading) return false

        let show = !$character.is('._lore')
        if ($lored !== null) {
            $lored.removeClass('_lore')
            $lored = null
            $lore.remove()
            $lore = null
            lore.editable = false
        }
        if (show) {
            lore.loading = true
            load(+$character.attr('character-id')).then((character) => {
                lore.loading = false
                $character.addClass('_lore')
                $lored = $character
                lore.editable = +$lored.attr('character-editable')
                let lore$ = tpl.lore.render({
                    text     : character.lore,
                    editable : lore.editable,
                    empty    : tpl.empty.render({
                        editable : lore.editable,
                    }),
                })
                $lore = $(lore$).appendTo($character)
            })
        }
    },
    cancel : () => {
        let id = +$lored.attr('character-id')
        character = cache[id]
        editor.remove()
        lore.update(character.lore)
    },
    update : (content) => {
        $lored.toggleClass('_hasLore', (content != null))
        $lore.toggleClass('_empty', !content).html(content || tpl.empty.render({editable:lore.editable}))
    },
    save : (content) => {
        let id = +$lored.attr('character-id')
        $.ajax({
            type     : 'POST',
            url      : '/character/' + id,
            data     : {
                lore_src : content,
            },
            dataType : 'json',
            xhrFields: {
                withCredentials: true
            },
            success  : function(character) {
                cache[id] = character
                editor.remove()
                lore.update(character.lore)
            }
        });
    }
}

function select($character)
{
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