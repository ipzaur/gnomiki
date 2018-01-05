var gallery = {
    inited : false,

    events : {
        click : function(ev) {
            var $el = $(ev.target);
        }
    },
    init : function() {
        with (gallery) {
            if (inited) {
                return true;
            }
            $(window).on(events);
            inited = true;
        }
    }
}

$(document).ready(function() {
    gallery.init()
});
