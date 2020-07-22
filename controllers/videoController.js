var onfido = require('../onfido.js');
var stream = require('stream');
const { Onfido, OnfidoApiError } = require('@onfido/api');

// Display list of all videos for an applicant.
exports.video_list = function(req, res) {
    res.send('NOT IMPLEMENTED: Video list for applicant:' + req.params.id);
};

// Display video upload form.
exports.video_upload = function(req, res) {
    const video = {
        applicant_id: req.params.id
    };
    const referrer = '*://*/*';
    console.log('>>>>>>>        referrer: ' + referrer);
    const sdkTokenRequest = {
        applicantId: req.params.id,
        // referrer: 'http://localhost:3000/*'
        referrer: referrer
    };
    onfido.sdkToken.generate( sdkTokenRequest )
        .then((sdkToken) => {
            res.render('videoUpload', { video: video, sdkToken: sdkToken });
        })
        .catch((error) => {
            if (error instanceof OnfidoApiError) {
                // An error response was received from the Onfido API, extra info is available.
                console.log(error.message);
                console.log(error.type);
                console.log(error.isClientError());
            } else {
                // No response was received for some reason e.g. a network error.
                console.log(error.message);
            }
        });
};


// Display detail page for a specific video.
exports.video_show = function(req, res) {
    onfido.liveVideo.find(req.params.id)
        .then((video) => {            
            res.render('video', { video: video })
        })
        .catch((error) => {
            if (error instanceof OnfidoApiError) {
                // An error response was received from the Onfido API, extra info is available.
                console.log(error.message);
                console.log(error.type);
                console.log(error.isClientError());
            } else {
                // No response was received for some reason e.g. a network error.
                console.log(error.message);
            }
        });
};

// Download a specific video.
exports.video_download = function(req, res) {
    res.send('NOT IMPLEMENTED: Video download: ' + req.params.id);
};

// Download a single frame of a specific video.
exports.video_frame = function(req, res) {
    res.send('NOT IMPLEMENTED: Video download single frame: ' + req.params.id);
};