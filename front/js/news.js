var $ = require('jquery')
var twig   = require('twig').twig

var $main = null

var cache = []

var editor = {
    $main : null,
    $news : null,
    $content : null,
    $title : null,

    data : null,

    tpl : twig({data :
        '<div class="news_editor form">'+
            '<input type="text" class="form_field" name="title" value="{{ title }}" placeholder="Заголовок новости">' +
            '<textarea class="form_content" name="content" placeholder="Текст новости">{{ content_src }}</textarea>' +
            '<div class="form_actions">'+
                '<a href="javascript:void(0);" class="button" editor-action="save">Сохранить</a>' +
                ' или ' +
                '<a href="javascript:void(0);" editor-action="cancel">отменить</a>'+
            '</div>' +
        '</div>'}),

    events : {
        click : (ev) => {
            let $el = $(ev.target)
            if ($el.is('[editor-action]')) {
                let action = $el.attr('editor-action')
                switch (action) {
                    case 'cancel' : return editor.close()
                    case 'save'   : return editor.save()
                }
            }
        }
    },

    init : ($news, news) => {
        editor.data = news
        editor.$news = $news
        if (editor.$main === null) {
            editor.$main = $(editor.tpl.render(editor.data)).on(editor.events)
            editor.$title = editor.$main.find('[name="title"]')
            editor.$content = editor.$main.find('[name="content"]')
        } else {
            editor.$title.val(news.title)
            editor.$content.val(news.content_src)
        }
        editor.$main.insertBefore($news)
    },

    save : () => {
        $.ajax({
            type     : 'POST',
            url      : '/news/' + editor.data.id,
            data     : {
                title       : editor.$title.val(),
                content_src : editor.$content.val(),
            },
            dataType : 'json',
            xhrFields: {
                withCredentials: true
            },
            success  : function(news) {
                cache[news.id] = news
                window.location.reload()
            }
        });
    },

    close : () => {
        editor.$main.remove()
        editor.$main = null
        editor.$news = null
        editor.data = null
    },
}

var events = {
    click : (ev) => {
        let $el = $(ev.target)
        if ($el.is('[news-action]')) {
            let action = $el.attr('news-action')
            switch (action) {
                case 'edit'   : return edit($el.closest('[news-elem="main"]'))
                case 'create' : return create()
            }
        }
    }
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
            url      :  '/news/' + id,
            dataType : 'json',
            xhrFields: {
                withCredentials: true
            },
            success : (news) => {
                cache[id] = news
            }
        })
    }
}


function create() {
    editor.init($main, {id : 0})
}

function edit($news) {
    load(+$news.attr('news-id')).then((news) => {
        editor.init($news, news)
    })
}

function init()
{
    $main = $('#news')
    if (!$main.length) {
        $main = null
        return false
    }
    $main.on(events)
}

module.exports = init