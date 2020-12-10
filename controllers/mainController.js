const { Onfido, Region, OnfidoApiError } = require('@onfido/api');
const { on } = require('nodemon');
const moment = require('moment');
const app = require('../app');

// Display index.
exports.index = function(req, res) {
    req.session.url = req.originalUrl;
    const applicant = (req.session.applicant)?req.session.applicant:null;
    if(applicant){
        res.redirect('/applicants/'+applicant.id);
    }
    
    const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
    res.render('index', { applicant: applicant, stacktrace: stacktrace });
};

exports.clearSession = function(req, res) {
    req.session.applicant = null;
    req.session.applicants = [];
    req.session.stacktrace = [];
    req.session.documents = [];
    req.session.photos = [];
    req.session.videos = [];
    req.session.check = null;
    req.session.reports = [];
    req.session.checks = [];
    res.redirect('/index');
};

exports.clearStacktrace = function(req, res) {
    req.session.stacktrace = [];
    res.redirect(req.session.url);
};

exports.listApplicants = function(req, res) {
    req.session.url = req.originalUrl;

    const onfido = new Onfido({ apiToken: req.session.apiToken });
    const nowRequest = moment();
    const request = { };
    const message = {
        date: nowRequest.format('YYYY-MM-DD HH:mm:ss.SSS'),
        api: 'List Applicants',
        type: 'REQUEST',
        delai: '',
        data: JSON.stringify(request, null, 2)
    };
    req.session.stacktrace.push(message);

    onfido.applicant.list().then((applicants) => {
        const nowResponse = moment();
        const message = {
            date: nowResponse.format('YYYY-MM-DD HH:mm:ss.SSS'),
            api: 'List Applicants',
            type: 'RESPONSE',
            delai: nowResponse-nowRequest,
            data: JSON.stringify(applicants, null, 2)
        };
        req.session.stacktrace.push(message);

        const applicant = (req.session.applicant)?req.session.applicant:null;
        const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
        const checks = (req.session.checks)?req.session.checks:[];
        const documents = (req.session.documents)?req.session.documents:[];
        const photos = (req.session.photos)?req.session.photos:[];
        const videos = (req.session.videos)?req.session.videos:[];
        res.render('applicants', { applicants: applicants, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos, checks: checks });
    });
};

exports.retrieveApplicant = function(req, res) {
    req.session.url = req.originalUrl;
    const applicantId = req.params.id;
    const onfido = new Onfido({ apiToken: req.session.apiToken });
    const nowRequest = moment();
    const request = { id: applicantId };
    const message = {
        date: nowRequest.format('YYYY-MM-DD HH:mm:ss.SSS'),
        api: 'Retrieve Applicant',
        type: 'REQUEST',
        delai: '',
        data: JSON.stringify(request, null, 2)
    };
    req.session.stacktrace.push(message);

    onfido.applicant.find(applicantId).then((applicant) => {
        const nowResponse = moment();
        const message = {
            date: nowResponse.format('YYYY-MM-DD HH:mm:ss.SSS'),
            api: 'Retrieve Applicant',
            type: 'RESPONSE',
            delai: nowResponse-nowRequest,
            data: JSON.stringify(applicant, null, 2)
        };
        req.session.stacktrace.push(message);
        req.session.applicant = applicant;
        
        // GET DOCUMENTS / SELFIES / VIDEOS
        function getFile(readerStream) {
            let file = '';
            readerStream.on('data', function(chunk) {
                file += chunk;
            });
            readerStream.on('end',function() {
                return file;
            });
            readerStream.on('error', function(err) {
                console.log(err.stack);
            });
        }
        const documents = onfido.document.list(applicant.id).then((documents) => Promise.all(documents.map(document => onfido.document.download(document.id).then((document) => {
            let stream = document.asStream();
            let file = '';
            stream.on('data', function(chunk) {
                file += chunk;
            });
            stream.on('end',function() {
                return file;
            });
            stream.on('error', function(err) {
                console.log(err.stack);
            });
        }))));
        const photos = onfido.livePhoto.list(applicant.id).then((photos) => Promise.all(photos.map(photo => onfido.livePhoto.download(photo.id).then((photo) => getFile(photo.asStream())))));
        const videos = onfido.liveVideo.list(applicant.id).then((videos) => Promise.all(videos.map(video => onfido.liveVideo.frame(video.id).then((video) => getFile(video.asStream())))));
        
        Promise.all([documents, photos, videos]).then((children) => {
            req.session.documents = children[0];
            req.session.photos = children[1];
            req.session.videos = children[2];
            const applicant = (req.session.applicant)?req.session.applicant:null;
            const applicants = (req.session.applicants)?req.session.applicants:[];
            const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
            res.render('actions', { applicants: applicants, applicant: applicant, stacktrace: stacktrace, documents: children[0], photos: children[1], videos: children[2] });
        });
    })
    .catch((error) => console.log(error.message));
};

exports.createApplicant = function(req, res) {
    const firstname = (req.body.firstname !== '')?req.body.firstname:'temp user';
    const lastname = (req.body.lastname !== '')?req.body.lastname:'to delete';
    const onfido = new Onfido({ apiToken: req.session.apiToken });
    const nowRequest = moment();
    const request = { firstName: firstname, lastName: lastname };
    const message = {
        date: nowRequest.format('YYYY-MM-DD HH:mm:ss.SSS'),
        api: 'Create Applicant',
        type: 'REQUEST',
        delai: '',
        data: JSON.stringify(request, null, 2)
    };
    req.session.stacktrace.push(message);

    onfido.applicant.create(request)
    .then((applicant) => {
        const nowResponse = moment();
        const message = {
            date: nowResponse.format('YYYY-MM-DD HH:mm:ss.SSS'),
            api: 'Create Applicant',
            type: 'RESPONSE',
            delai: nowResponse-nowRequest,
            data: JSON.stringify(applicant, null, 2)
        };
        req.session.stacktrace.push(message);
        res.redirect('/applicants/'+applicant.id);
    })
    .catch((error) => console.log(error.message));
};

exports.deleteApplicant = function(req, res) {
    const applicantId = req.params.id;
    const onfido = new Onfido({ apiToken: req.session.apiToken });
    const nowRequest = moment();
    const request = { id: applicantId };
    const message = {
        date: nowRequest.format('YYYY-MM-DD HH:mm:ss.SSS'),
        api: 'Delete Applicant',
        type: 'REQUEST',
        delai: '',
        data: JSON.stringify(request, null, 2)
    };
    req.session.stacktrace.push(message);

    onfido.applicant.delete(applicantId).then(() => {
        const nowResponse = moment();
        const message = {
            date: nowResponse.format('YYYY-MM-DD HH:mm:ss.SSS'),
            api: 'Delete Applicant',
            type: 'RESPONSE',
            delai: nowResponse-nowRequest,
            data: null
        };
        req.session.stacktrace.push(message);
        if(req.session.applicant.id == req.params.id) {
            req.session.applicant = null; 
            res.redirect('/index');
        } else {
            res.redirect(req.session.url);
        }
    })
    .catch((error) => console.log(error.message));
};

exports.deleteApplicants = function(req, res) {
    const applicantIds = req.body.applicantsToDelete;
    const onfido = new Onfido({ apiToken: req.session.apiToken });

    const promises = applicantIds.map(applicantId => onfido.applicant.delete(applicantId));
    Promise.all(promises).then(() => res.redirect('/index'))
    .catch((error) => console.log(error.message));
};

exports.initSdk = function(req, res) {
    req.session.url = req.originalUrl;
    const onfido = new Onfido({ apiToken: req.session.apiToken });
    const nowRequest = moment();
    const request = { 
        applicantId: req.session.applicant.id,
        referrer: '*://*/*'
    };
    const message = {
        date: nowRequest.format('YYYY-MM-DD HH:mm:ss.SSS'),
        api: 'Get SDK Token',
        type: 'REQUEST',
        delai: '',
        data: JSON.stringify(request, null, 2)
    };
    req.session.stacktrace.push(message);

    onfido.sdkToken.generate( request ).then((sdkToken) => {
        const nowResponse = moment();
        const message = {
            date: nowResponse.format('YYYY-MM-DD HH:mm:ss.SSS'),
            api: 'Get SDK Token',
            type: 'RESPONSE',
            delai: nowResponse-nowRequest,
            data: JSON.stringify(sdkToken, null, 2)
        };
        req.session.stacktrace.push(message);

        const applicant = (req.session.applicant)?req.session.applicant:null;
        const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
        const applicants = (req.session.applicants)?req.session.applicants:[];
        const documents = (req.session.documents)?req.session.documents:[];
        const photos = (req.session.photos)?req.session.photos:[];
        const videos = (req.session.videos)?req.session.videos:[];
        res.render('sdk', { applicants: applicants, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos, sdkToken: sdkToken });
    });
};

exports.initCheck = function(req, res) {
    req.session.url = req.originalUrl;
    req.session.check = null;
    const applicant = (req.session.applicant)?req.session.applicant:null;
    const applicants = (req.session.applicants)?req.session.applicants:[];
    const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
    const documents = (req.session.documents)?req.session.documents:[];
    const photos = (req.session.photos)?req.session.photos:[];
    const videos = (req.session.videos)?req.session.videos:[];
    res.render('check', { applicants: applicants, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos, check: null});
};

exports.createCheck = function(req, res) {
    // res.send(JSON.stringify(req.body));
    req.session.url = req.originalUrl;
    const applicant = (req.session.applicant)?req.session.applicant:null;    
    const reportNames = Array.isArray(req.body.reports)?req.body.reports:[req.body.reports];
    // TODO: use selected documents
    const onfido = new Onfido({ apiToken: req.session.apiToken });
    const nowRequest = moment();
    const request = { 
        applicantId: applicant.id,
        reportNames: reportNames,
        // asynchronous: true,
        // tags: null,
        // documentIds: null
     };
    const message = {
        date: nowRequest.format('YYYY-MM-DD HH:mm:ss.SSS'),
        api: 'Create Check',
        type: 'REQUEST',
        delai: '',
        data: JSON.stringify(request, null, 2)
    };
    req.session.stacktrace.push(message);

    onfido.check.create(request).then((check) => {
        const nowResponse = moment();
        const message = {
            date: nowResponse.format('YYYY-MM-DD HH:mm:ss.SSS'),
            api: 'Create Check',
            type: 'RESPONSE',
            delai: nowResponse-nowRequest,
            data: JSON.stringify(check, null, 2)
        };
        req.session.stacktrace.push(message);

        res.redirect('/checks/'+check.id);
    })
    .catch((error) => console.log(error.message));
};

exports.retrieveCheck = function(req, res) {
    // res.send(JSON.stringify(req.body));
    req.session.url = req.originalUrl;
    const checkId = req.params.id;   
    
    const onfido = new Onfido({ apiToken: req.session.apiToken });
    const nowRequest = moment();
    const request = { 
        id: checkId
     };
    const message = {
        date: nowRequest.format('YYYY-MM-DD HH:mm:ss.SSS'),
        api: 'Retrieve Check',
        type: 'REQUEST',
        delai: '',
        data: JSON.stringify(request, null, 2)
    };
    req.session.stacktrace.push(message);

    onfido.check.find(checkId).then((check) => {
        const nowResponse = moment();
        const message = {
            date: nowResponse.format('YYYY-MM-DD HH:mm:ss.SSS'),
            api: 'Retrieve Check',
            type: 'RESPONSE',
            delai: nowResponse-nowRequest,
            data: JSON.stringify(check, null, 2)
        };
        req.session.stacktrace.push(message);
        req.session.check = check;
        
        // GET REPORTS
        function fnRetrieveReport(reportId) {
            const nowRequest = moment();
            const request = { 
                id: reportId
            };
            const message = {
                date: nowRequest.format('YYYY-MM-DD HH:mm:ss.SSS'),
                api: 'Retrieve Report',
                type: 'REQUEST',
                delai: '',
                data: JSON.stringify(request, null, 2)
            };
            req.session.stacktrace.push(message);

            return onfido.report.find(reportId).then((report) => {
                const nowResponse = moment();
                const message = {
                    date: nowResponse.format('YYYY-MM-DD HH:mm:ss.SSS'),
                    api: 'Retrieve Report',
                    type: 'RESPONSE',
                    delai: nowResponse-nowRequest,
                    data: JSON.stringify(report, null, 2)
                };
                req.session.stacktrace.push(message);

                return report;
            });
        }

        const promises = check.reportIds.map(reportId => Promise.resolve(fnRetrieveReport(reportId)));
        
        Promise.all(promises).then((reports) => {
            req.session.reports = reports;

            const applicant = (req.session.applicant)?req.session.applicant:null;
            const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
            const applicants = (req.session.applicants)?req.session.applicants:[];
            const documents = (req.session.documents)?req.session.documents:[];
            const photos = (req.session.photos)?req.session.photos:[];
            const videos = (req.session.videos)?req.session.videos:[];
            res.render('check', { applicants: applicants, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos, check: check, reports: reports});
        });
    })
    .catch((error) => console.log(error.message));
};

exports.listChecks = function(req, res) {
    req.session.url = req.originalUrl;
    const applicantId = req.session.applicant.id;

    const onfido = new Onfido({ apiToken: req.session.apiToken });
    const nowRequest = moment();
    const request = { 
        id: applicantId
     };
    const message = {
        date: nowRequest.format('YYYY-MM-DD HH:mm:ss.SSS'),
        api: 'List Checks',
        type: 'REQUEST',
        delai: '',
        data: JSON.stringify(request, null, 2)
    };
    req.session.stacktrace.push(message);

    onfido.check.list(applicantId).then((checks) => {
        const nowResponse = moment();
        const message = {
            date: nowResponse.format('YYYY-MM-DD HH:mm:ss.SSS'),
            api: 'List Checks',
            type: 'RESPONSE',
            delai: nowResponse-nowRequest,
            data: JSON.stringify(checks, null, 2)
        };
        req.session.stacktrace.push(message);

        const applicant = (req.session.applicant)?req.session.applicant:null;
        const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
        const applicants = (req.session.applicants)?req.session.applicants:[];
        const documents = (req.session.documents)?req.session.documents:[];
        const photos = (req.session.photos)?req.session.photos:[];
        const videos = (req.session.videos)?req.session.videos:[];
        res.render('checks', { applicants: applicants, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos, checks: checks });
    });
};
