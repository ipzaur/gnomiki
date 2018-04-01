var striptags = require('striptags');

function parseContent(content, keep)
{
    if (!keep) {
        keep = ['h3', 'a', 'p', 'gallery', 'img', 'b', 'i', 'ul', 'li', 'iframe']
    }
    content = striptags(content, keep)
    if (!content) {
        return content
    }

    content = content.replace(/<ul>\n*<li>/gm, '<ul><li>')
    content = content.replace(/<\/li>\n*<\/ul>/gm, '</li></ul>')
    content = content.replace(/(<\/h3>|<\/iframe>|<\/ul>|<\/li>|<\/p>|<\/gallery>)\n*(<h3>|<iframe|<li>|<ul>|<p>|<gallery>)/gm, '$1$2')

    var gallery
    while (gallery = content.match(/<gallery>([^]+)<\/gallery>/m)) {
        let galleryContent = ''
        let images = gallery[1].match(/<img(.*?)>/g)
        if (images) {
            galleryContent = '<div class="gallery" gallery-elem="main">'
            for (let i=0; images[i]; i++) {
                let image = images[i]

                let thumb = image.match(/src="(.*?)"/)[1]
                let orig  = image.match(/data-orig="(.*?)"/)[1]
                let title = image.match(/title="(.*?)"/)

                let media = '<a class="gallery_thumb" href="' + orig + '" target="_blank" gallery-action="show"' + (title !== null ? ' title="' + title[1] + '"' : '') + '>'
                media += '<img class="gallery_img" src="' + thumb + '" alt="">'
                if (title !== null) {
                    media += '<span class="gallery_title">' + title[1] + '</span>'
                }
                media += '</a>'

                galleryContent += media
            }
            galleryContent += '</div>'
        }
        content = content.replace(gallery[0], galleryContent)
    }

    content = content.replace(/\n/g, '<br>')
    return content
}

module.exports = parseContent;