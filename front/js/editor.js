var $ = require('jquery')
var twig    = require('twig').twig

var $main    = null
var $content = null
var onSave   = null
var onCancel = null

var defaultButtons = [
    'b',
    'i',
    'link',
    'img',
    'gallery'
]
var buttonsInfo = {
    'link' : {
        title  : 'Вставить ссылку',
        action : 'link',
        class  : 'link',
    },
    'b' : {
        title  : 'Выделить жирным',
        action : 'bold',
        class  : 'bold',
    },
    'i' : {
        title  : 'Выделить курсивом',
        action : 'italic',
        class  : 'italic',
    },
    'gallery' : {
        title  : 'Вставить галерею',
        action : 'gallery',
        class  : 'gallery',
    }
}

var tpl = {
    editor : 
        '<div class="editor">' +
            '{% if buttons|length %}' +
                '<div class="editor_actions">' +
                    '{% for button in buttons %}' +
                        '<a href="javascript:void(0);" class="editor_action-{{ button.class }} button" editor-action="{{ button.action }}" title="{{ button.title }}"></a>' +
                    '{% endfor %}' +
                '</div>' +
            '{% endif %}' +
            '<textarea name="content" class="editor_content" editor-elem="content">{{ content }}</textarea>' +
            '<div class="editor_actions">' +
                '<a href="javascript:void(0);" class="button" editor-action="save">Сохранить</a>' +
                ' или ' +
                '<a href="javascript:void(0);" editor-action="cancel">отменить</a>'+
            '</div>' +
        '</div>'
}

var events = {
    click : (ev) => {
        let $el = $(ev.target)
        if ($el.is('[editor-action]')) {
            let action = $el.attr('editor-action')
            switch (action) {
                case 'cancel' : return cancel()
                case 'save'   : return save()
            }
        }
    }
}

function remove() {
    $content = null
    $main.remove()
    $main    = null
    onSave   = null
    onCancel = null
}

function cancel() {
    if (onCancel !== null) {
        onCancel()
    }
}

function save() {
    if (onSave !== null) {
        onSave($content.val())
    }
}

function init($block, content, options) {
    let buttons = defaultButtons
    if (options) {
        if (options.onSave) {
            onSave = options.onSave
        }
        if (options.onCancel) {
            onCancel = options.onCancel
            onCancel = options.onCancel
        }
        if (options.buttons) {
            buttons = options.buttons
        }
    }
    for (let i=0; buttons[i]; i++) {
        let button = buttons[i]
        if (!buttonsInfo[button]) {
            buttons.splice(i, 1)
            i--
            continue
        }
        buttons[i] = buttonsInfo[button]
    }
    let main$ = twig({data: tpl.editor}).render({
        buttons : buttons,
        content : content,
    })
    $main = $(main$).on(events).appendTo($block)
    $content = $main.find('[editor-elem="content"]')
    $content.focus()
}

exports.remove = remove
exports.init   = init