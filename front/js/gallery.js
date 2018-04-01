const $    = require('jquery')
const twig = require('twig').twig
const lightbox = require('./lightbox')

function create($main)
{
    if ($main.is('._inited')) {
        return true
    }
    var gallery = {
        $main : $main,
        list : [],
        events : {
            click : (ev) => {
                let $el = $(ev.target)
                let $thumb = $el.closest('[gallery-action="show"]')
                if ($thumb.length) {
                    console.log($thumb.index());
                    //gallery.show($el.)
                    ev.preventDefault()
                }
            }
        },
        init : () => {
            let $thumbs = gallery.$main.find('img')
            for (let i=0; $thumbs[i]; i++) {
console.log(i);
            }
            gallery.$main.on(gallery.events)
        }
    }
    gallery.init()
    return gallery
}

function init()
{
    $galleries = $('[gallery-elem="main"]')
    for (let i=0; $galleries[i]; i++) {
        console.log(i);
        create($($galleries[i]))
    }
}

module.exports = init