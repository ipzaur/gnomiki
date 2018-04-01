var $ = require('jquery')

var uploader = {
    do : function(ev, params) {
        if (!ev) {
            return false;
        }
        if ( !params || !params.url ) {
            return false;
        }

        ev.stopPropagation(); // Stop stuff happening
        ev.preventDefault(); // Totally stop stuff happening

        // Create a formdata object and add the files
        var data = new FormData();
        if (params.otherData) {
            for (var key in params.otherData) if (params.otherData.hasOwnProperty(key)) {
                data.append(key, params.otherData[key]);
            }
        }
        for (var key in ev.target.files) if (ev.target.files.hasOwnProperty(key)) {
            data.append(key, ev.target.files[key]);
        }

        $.ajax({
            url: params.url,
            type: 'POST',
            data: data,
            cache: false,
            dataType: 'json',
            processData: false, // Don't process the files
            contentType: false, // Set content type to false as jQuery will tell the server its a query string request
            success: function(json, textStatus, jqXHR) {
                if (json.error && json.error.length) {
                    return false;
                }
                if (params.done) {
                    params.done(json);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                // Handle errors here
                console.log('ERRORS: ' + textStatus)
                // STOP LOADING SPINNER
            }
        });
    }
}


module.exports = uploader