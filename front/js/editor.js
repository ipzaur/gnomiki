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
    'link'    : 'Вставить ссылку',
    'bold'    : 'Выделить жирным',
    'italic'  : 'Выделить курсивом',
    'gallery' : 'Вставить галерею',
}

var tpl = {
    editor : twig({data:
        '<div class="form">' +
            '{% if buttons|length %}' +
                '<div class="form_actions">' +
                    '{% for button in buttons %}' +
                        '<a href="javascript:void(0);" class="form_action-{{ button.label }} button" editor-action="{{ button.label }}" title="{{ button.title }}"></a>' +
                    '{% endfor %}' +
                '</div>' +
            '{% endif %}' +
            '<textarea name="content" class="form_content" editor-elem="content">{{ content }}</textarea>' +
            '<div class="form_actions">' +
                '<a href="javascript:void(0);" class="button" editor-action="save">Сохранить</a>' +
                ' или ' +
                '<a href="javascript:void(0);" editor-action="cancel">отменить</a>'+
            '</div>' +
        '</div>'})
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
        buttons[i] = {
            label : button,
            title : buttonsInfo[button],
        }
    }
    let main$ = tpl.editor.render({
        buttons : buttons,
        content : content,
    })
    $main = $(main$).on(events).appendTo($block)
    $content = $main.find('[editor-elem="content"]')
    $content.focus()
}

exports.remove = remove
exports.init   = init