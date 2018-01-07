function parseContent(content)
{
    if (!content) return content
    content = content.replace(/\n/g, '<br>')
    console.log(content);
    return '<p>' + content + '</p>'
}

module.exports = parseContent;