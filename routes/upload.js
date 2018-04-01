const express    = require('express')
const fileUpload = require('express-fileupload');
const fs         = require('fs')
const jimp       = require('jimp')
const config     = require('../../config')

const app = express();
const router = express.Router();

router.use(fileUpload());


router.delete('/', function(req, res) {
    if (!res.user || !res.user.Role.news) {
        return res.sendStatus(403)
    }
    if (!req.body.files) {
        return res.status(400).send('No files were uploaded.')
    }


});


router.post('/', function(req, res) {
    if (!res.user || !res.user.Role.news) {
        return res.sendStatus(403)
    }
    if (!req.files) {
        return res.status(400).send('No files were uploaded.')
    }

    let count = Object.keys(req.files).length
    let errors = []
    let result = []

    let onDone = (fileUrl, err) => {
        count--
        if (err) {
            errors.push(err)
        } else {
            result.push(fileUrl)
        }
        if (!count) {
            if (errors.length) {
                res.status(500).send(errors.join(' | '))
            } else {
                res.json(result)
            }
        }
    }

    let contentType = req.body.content_type || 'media'
    let contentId   = req.body.content_id || '0'

    for (let i=0; req.files[i]; i++) {
        let orig = {
            name : contentType + '_' + contentId + '_' + i + '_' + (new Date).getTime() + Math.floor(Math.random()*100) + '.jpg'
        }
        orig.url  = '/i/temp/' + orig.name
        orig.path = config.path + 'public' + orig.url

        req.files[i].mv(orig.path, function(err) {
            jimp.read(req.files[i].data, function (err, media) {
                if (err) {
                    return onDone(err)
                }

                let thumb = {
                    url  : orig.url.replace('.jpg', '_thumb.jpg'),
                    path : orig.path.replace('.jpg', '_thumb.jpg'),
                }
                media.resize(jimp.AUTO, 250)
                    .quality(80)
                    .write(thumb.path, () => {
                        onDone({
                            orig  : orig.url,
                            thumb : thumb.url,
                        }, err)
                    });
            })
        })
    }
});



module.exports = router;
