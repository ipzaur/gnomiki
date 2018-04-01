var $ = require('jquery')
var twig     = require('twig').twig
var uploader = require('./uploader')

var $main = null

var cache = []

var editor = {
    $main    : null,
    $news    : null,
    $content : null,
    $title   : null,
    $media   : null,

    data : null,

    tpl : {
        main : twig({data :
            '<form class="news_editor form" method="POST" action="{{ action }}" enctype="multipart/form-data">' +
                '<input type="text" class="form_field" name="title" value="{{ title }}" placeholder="Заголовок новости">' +
                '<textarea class="form_content" name="content" placeholder="Текст новости">{{ content_src }}</textarea>' +
                '<div class="form_actions">'+
                    '<a href="javascript:void(0);" class="button" editor-action="save">Сохранить</a>' +
                    ' или ' +
                    '<a href="javascript:void(0);" editor-action="cancel">отменить</a>' +
                    '{% if id %}' +
                        '<a href="javascript:void(0);" class="button-red form_remove" editor-action="remove">удалить</a>' +
                    '{% endif %}' +
                '</div>' +
                '<div class="form_actions">'+
                    '<span class="form_upload">' +
                        'Загрузить фотографии' +
                        '<input class="form_uploader" name="upload[]" media-action="upload" type="file" multiple>' +
                    '</span>' +
                    '<div class="form_medias" editor-elem="media"></div>' +
                '</div>' +
            '</form>'}),
        media : twig({data : '<img class="form_media" src="{{ thumb }}" data-orig="{{ orig }}" alt="" height="100" editor-action="media">'})
    },

    events : {
        click : (ev) => {
            let $el = $(ev.target)
            if ($el.is('[editor-action]')) {
                let action = $el.attr('editor-action')
                switch (action) {
                    case 'cancel' : return editor.close()
                    case 'save'   : return editor.save()
                    case 'remove' : return editor.remove()
                    case 'media'  : return editor.insertMedia($el.attr('src'), $el.attr('data-orig'))
                }
            }
        },
        change : (ev) => {
            var el = $(ev.target)
            if (el.is('[media-action="upload"]')) {
                editor.upload(ev)
            }
        },
    },

    insertMedia : function(thumb, orig) {
        if (!thumb) {
            return false;
        }
        let title = prompt('Комментарий к изображению (не обязательно)');
        if (title === null) {
            return false
        }
        let pos = {
            start : editor.$content[0].selectionStart || 0,
            end   : editor.$content[0].selectionEnd || 0,
        }

        let mediaText = "\n" + '<img src="' + thumb + '" data-orig="' + orig + '"';
        if (title != ''){
            mediaText += ' title="' + title + '"';
        }
        mediaText += ">\n";

        let selectedLength = pos.end - pos.start;
        let content = editor.$content.val().split('');
        content.splice(pos.start, selectedLength, mediaText);
        content = content.join('');
        editor.$content.val(content);
    },

    upload : (ev) => {
        uploader.do(ev, {
            url : '/upload/',
            otherData : {
                content_type : 'news',
                content_id   : editor.data ? editor.data.id : null,
            },
            done : function(files) {
                for (let i=0; files[i]; i++) {
                    $(editor.tpl.media.render(files[i])).appendTo(editor.$media)
                }
            }
        })
    },

    init : ($news, news) => {
        editor.data = news
        editor.$news = $news
        if (editor.$main === null) {
            editor.$main    = $(editor.tpl.main.render(editor.data)).on(editor.events)
            editor.$title   = editor.$main.find('[name="title"]')
            editor.$content = editor.$main.find('[name="content"]')
            editor.$media   = editor.$main.find('[editor-elem="media"]')
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

    remove : () => {
        if (!editor.data.id) {
            return false
        }
        $.ajax({
            type     : 'DELETE',
            url      : '/news/' + editor.data.id,
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
    },

    close : () => {
        editor.$content = null
        editor.$title   = null
        editor.$news    = null
        editor.data = null
        editor.$main.remove()
        editor.$main = null
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