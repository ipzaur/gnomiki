function menu(current) {
    return [{
        label : 'news',
        title : 'Новости',
        url   : '/',
        isCurrent : (current == 'news'),
    },{
        label : 'about',
        title : 'О нас',
        url   : '/about/',
        isCurrent : (current == 'about'),
    },{
        label : 'pve',
        title : 'ПвЕ',
        url   : '/pve/',
        isCurrent : (current == 'pve'),
    },{
        label : 'stories',
        title : 'Истории',
        url   : '/stories/',
        isCurrent : (current == 'stories'),
    }]
}

module.exports = menu;