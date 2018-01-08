var striptags = require('striptags');

function parseContent(content, keep)
{
    if (!keep) {
        keep = ['a', 'p', 'gallery', 'img', 'b', 'i', 'iframe']
    }
    content = striptags(content, keep)
    if (!content) {
        return content
    }
    content = content.replace(/\n/g, '<br>')
    return '<p>' + content + '</p>'
}

module.exports = parseContent;