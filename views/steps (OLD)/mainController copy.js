const { Onfido } = require('@onfido/api');
const moment = require('moment');
const axios = require('axios');
const { get } = require('request');
const { use } = require('../../routes/mainRouter');

axios.defaults.baseURL = 'https://api.onfido.com/v3/';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';

const logInStacktrace = function (api, type, nowRequest, data, stacktrace) {
    const now = moment();
    const message = {
        date: now.format('YYYY-MM-DD HH:mm:ss.SSS'),
        api: api,
        type: type,
        delai: (type === 'RESPONSE')?now-nowRequest:'',
        data: JSON.stringify(data, null, 2)
    };
    stacktrace.push(message);
    return now;
};

const getAllResourcesByApplicant = function (applicant_id) {
    // get applicant / documents / live_photo / live_video / checks & reports
    const applicant = axios.default.get('/applicants/'+applicant_id).then(response => response.data);
    const documents = axios.default.get('/documents?applicant_id='+applicant_id).then(response => response.data.documents);
    const photos = axios.default.get('/live_photos?applicant_id='+applicant_id).then(response => response.data.live_photos);
    const videos = axios.default.get('/live_videos?applicant_id='+applicant_id).then(response => response.data.live_videos); 
    
    const getCheckAndReports = function(check) {
        axios.default.get('/reports?check_id='+check.id).then(response => {
            check['reports'] = response.data.reports;
            return check;
        });
    }    
    const checks = axios.default.get('/checks?applicant_id='+applicant_id).then(response => response.data.checks.map(check => getCheckAndReports(check)));
    
    Promise.all([applicant, documents, photos, videos, checks]).then(children => { 
       let applicant = children[0];
       applicant['documents'] = children[1];
       applicant['photos'] = children[2];
       applicant['videos'] = children[3];
       applicant['checks'] = children[4];
       return applicant;
    });
};

const getAllResourcesByCheck = function (check_id) {
    // get checks then reports / applicant / documents / live_photo / live_video
    axios.default.get('/checks/'+check_id).then(response => {
        let check = response.data;

        const reports = axios.default.get('/reports?check_id='+check.id).then(response => response.data.reports);
        const applicant = axios.default.get('/applicants/'+check.applicant_id).then(response => response.data);
        const documents = axios.default.get('/documents?applicant_id='+check.pplicant_id).then(response => response.data.documents);
        const photos = axios.default.get('/live_photos?applicant_id='+check.applicant_id).then(response => response.data.live_photos);
        const videos = axios.default.get('/live_videos?applicant_id='+check.applicant_id).then(response => response.data.live_videos);

        Promise.all([reports, applicant, documents, photos, videos]).then(children => { 
            check['reports'] = children[0];
            let applicant = children[1];
            applicant['documents'] = children[2];
            applicant['photos'] = children[3];
            applicant['videos'] = children[4];
            check['applicant'] = applicant;
            return check;
        });
    });
};

const getAllResourcesByReport = function (report_id) {
    // get report then check & documents then applicant / live_photo / live_video
    axios.default.get('/reports/'+report_id).then(response => {
        let report = response.data;
        const check = axios.default.get('/checks/'+report.check_id).then(response => response.data);
        const documents = report.documents.map(id => axios.default.get('/documents/'+id).then(response => response.data));
        Promise.all([check, documents]).then(children => {
            let check = children[0];
            report['check'] = check;
            report['documents'] = children[1];
            const applicant = axios.default.get('/applicants/'+check.applicant_id).then(response => response.data);
            const photos = axios.default.get('/live_photos?applicant_id='+check.applicant_id).then(response => response.data.live_photos);
            const videos = axios.default.get('/live_videos?applicant_id='+check.applicant_id).then(response => response.data.live_videos);
            Promise.all([applicant, photos, videos]).then(children => { 
                let applicant = children[0];
                applicant['photos'] = children[1];
                applicant['videos'] = children[2];
                report['applicant'] = applicant;
                return report;
            });
        });
    });
};

// GLOBAL
exports.index = function(req, res, next) {
    axios.defaults.headers.common['Authorization'] = 'Token token='+req.session.apiToken;
    req.session.url = req.originalUrl;
    const applicant = (req.session.applicant)?req.session.applicant:null;
    if(applicant){
        res.redirect('/applicants/'+applicant.id);
    }
    const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
    res.render('index', { applicant: applicant, stacktrace: stacktrace});
};

exports.clearSession = function(req, res, next) {
    req.session.applicant = null;
    req.session.applicants = [];
    req.session.stacktrace = [];
    req.session.documents = [];
    req.session.photos = [];
    req.session.videos = [];
    req.session.check = null;
    req.session.reports = [];
    req.session.checks = [];
    req.session.extraction = null;
    req.session.url = null;
    req.session.usecase = null;
    req.session.current_index = null;
    res.redirect('/index');
};

exports.clearStacktrace = function(req, res, next) {
    req.session.stacktrace = [];
    res.redirect(req.session.url);
};

exports.listApplicants = function(req, res, next) {
    req.session.url = req.originalUrl;
    const page = (req.query.page)?req.query.page:1;
    
    const data = { };
    const nowRequest = logInStacktrace('List Applicants', 'REQUEST', null, data, req.session.stacktrace);
    
    axios.default.get('/applicants?page='+page).then(response => {
    
        logInStacktrace('List Applicants', 'RESPONSE', nowRequest, response.data, req.session.stacktrace);
        const totalApplicants = response.headers['x-total-count'];
        const totalPages = Math.ceil(totalApplicants/20)

        const enhancedApplicant = function(applicant) {
            const total_checks = axios.default.get('/checks?applicant_id='+applicant.id).then(response => response.data.checks.length);
            const photo = axios.default.get('/live_photos?applicant_id='+applicant.id).then(response => (response.data.live_photos.length > 0)?response.data.live_photos[0]:null);
            const video = axios.default.get('/live_videos?applicant_id='+applicant.id).then(response => (response.data.live_videos.length > 0)?response.data.live_videos[0]:null);
            return Promise.all([total_checks, photo, video]).then(children => {
                applicant['total_checks'] = children[0];
                applicant['photo'] = children[1];
                applicant['video'] = children[2];
                return applicant;
            });
        }

        const applicants = response.data.applicants.map(applicant => enhancedApplicant(applicant));
        Promise.all(applicants).then(applicants => {
            const applicant = (req.session.applicant)?req.session.applicant:null;
            const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
            const checks = (req.session.checks)?req.session.checks:[];
            const documents = (req.session.documents)?req.session.documents:[];
            const photos = (req.session.photos)?req.session.photos:[];
            const videos = (req.session.videos)?req.session.videos:[];
            res.render('applicants', { page: page, totalPages: totalPages, totalApplicants: totalApplicants, applicants: applicants, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos, checks: checks });
        });
    })
    .catch((error) => {console.log(error.message);next(error);});
};

exports.retrieveApplicant = function(req, res, next) {
    req.session.url = req.originalUrl;
    const applicant_id = req.params.id;
    
    const data = { id: applicant_id };

    const logAndGetApplicant = function(applicant_id) {
        const nowRequest = logInStacktrace('Retrieve Applicant', 'REQUEST', null, data, req.session.stacktrace);
        return axios.default.get('/applicants/'+applicant_id).then((response) => {
            const applicant = response.data;
            logInStacktrace('Retrieve Applicant', 'RESPONSE', nowRequest, applicant, req.session.stacktrace);
            return applicant;
        });
    }    

    const applicant = logAndGetApplicant(applicant_id);
    const documents = axios.default.get('/documents?applicant_id='+applicant_id).then(response => response.data.documents);
    const photos = axios.default.get('/live_photos?applicant_id='+applicant_id).then(response => response.data.live_photos);
    const videos = axios.default.get('/live_videos?applicant_id='+applicant_id).then(response => response.data.live_videos);
    
    Promise.all([applicant, documents, photos, videos]).then((children) => {
        req.session.applicant = children[0];
        req.session.documents = children[1];
        req.session.photos = children[2];
        req.session.videos = children[3];
        const applicants = (req.session.applicants)?req.session.applicants:[];
        const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
        res.render('applicant_home', { applicants: applicants, applicant: children[0], stacktrace: stacktrace, documents: req.session.documents, photos: req.session.photos, videos: req.session.videos });
    })
    .catch((error) => {console.log(error.message);next(error);});
};

exports.updateApplicant = function(req, res, next) {
    const applicant_id = req.params.id;
    const firstname = (req.body.firstname !== '')?req.body.firstname:'';
    const lastname = (req.body.lastname !== '')?req.body.lastname:'';

    const data = { first_name: firstname, last_name: lastname };
    const nowRequest = logInStacktrace('Update Applicant', 'REQUEST', null, data, req.session.stacktrace);
    
    axios.default.put('/applicants/'+applicant_id, data).then((response) => {
        
        logInStacktrace('Update Applicant', 'RESPONSE', nowRequest, response.data, req.session.stacktrace);
        req.session.applicant = response.data;

        res.redirect('/checks/new');
    })
    .catch((error) => {console.log(error.message);next(error);});
};

exports.createApplicant = function(req, res, next) {
    const firstname = (req.body.firstname !== '')?req.body.firstname:'temp user';
    const lastname = (req.body.lastname !== '')?req.body.lastname:'to delete';
    
    const data = { first_name: firstname, last_name: lastname };
    const nowRequest = logInStacktrace('Create Applicant', 'REQUEST', null, data, req.session.stacktrace);
    axios.default.post('/applicants/', data).then((response) => {

        logInStacktrace('Create Applicant', 'RESPONSE', nowRequest, response.data, req.session.stacktrace);
        const applicant = response.data;

        res.redirect('/applicants/'+applicant.id);
    })
    .catch((error) => {console.log(error.message);next(error);});
};

exports.deleteApplicant = function(req, res, next) {
    const applicant_id = req.params.id;
    
    const data = { id: applicant_id };
    const nowRequest = logInStacktrace('Delete Applicant', 'REQUEST', null, data, req.session.stacktrace);

    axios.default.delete('/applicants/'+applicant_id).then(() => {
        logInStacktrace('Delete Applicant', 'RESPONSE', nowRequest, {}, req.session.stacktrace);
        
        if(req.session.applicant.id == req.params.id) {
            req.session.applicant = null; 
            res.redirect('/applicants');
        } else {
            res.redirect(req.session.url);
        }
    })
    .catch((error) => {console.log(error.message);next(error);});
};

exports.deleteApplicants = function(req, res, next) {
    const applicant_ids = req.body.applicantsToDelete;
    
    if(Array.isArray(applicant_ids)){
        const promises = applicant_ids.map(applicant_id => axios.default.delete('/applicants/'+applicant_id));
        Promise.all(promises).then(() => res.redirect('/applicants'))
        .catch((error) => {console.log(error.message);next(error);});
    } else {
        axios.default.delete('/applicants/'+applicant_ids).then(() => res.redirect('/applicants'))
        .catch((error) => {console.log(error.message);next(error);});
    }
};

// TODO TGA LATER: remove Onfido nodeJS client to download document
exports.downloadDocument = function(req, res, next) {
    res.set('Cache-control', 'public, max-age=15552000');
    const onfido = new Onfido({ apiToken: req.session.apiToken });
    const id = req.params.id;
    onfido.document.download(id).then(photo => photo.asStream().pipe(res)).catch((error) => {console.log(error.message);next(error);});
};

exports.downloadPhoto = function(req, res, next) {
    res.set('Cache-control', 'public, max-age=15552000');
    const onfido = new Onfido({ apiToken: req.session.apiToken });
    const id = req.params.id;
    onfido.livePhoto.download(id).then(photo => photo.asStream().pipe(res)).catch((error) => {console.log(error.message);next(error);});
};

exports.downloadVideoFrame = function(req, res, next) {
    res.set('Cache-control', 'public, max-age=15552000');
    const onfido = new Onfido({ apiToken: req.session.apiToken });
    const id = req.params.id;
    onfido.liveVideo.frame(id).then(frame => frame.asStream().pipe(res)).catch((error) => {console.log(error.message);next(error);});
};

exports.globalSearch = function(req, res, next) {
    const id = req.query.uuid;
    const applicant = axios.default.get('/applicants/'+id).then(response => response.data).catch(() => null);
    const document = axios.default.get('/documents/'+id).then(response => response.data).catch(() => null);
    const check = axios.default.get('/checks/'+id).then(response => response.data).catch(() => null);
    const report = axios.default.get('/reports/'+id).then(response => response.data).catch(() => null);

    Promise.all([applicant, document, check, report]).then(children => {
        const results = {
            applicant: children[0],
            document: children[1],
            check: children[2],
            report: children[3]
        }
        res.render('search', {results: results});
    });
}

// SDK & CHECK
exports.initSdk = function(req, res, next) {
    req.session.url = req.originalUrl;
    
    const data = { 
        applicant_id: req.session.applicant.id,
        referrer: '*://*/*'
    };
    const nowRequest = logInStacktrace('Get SDK Token', 'REQUEST', null, data, req.session.stacktrace);
    
    axios.default.post('/sdk_token/', data).then((response) => {
        logInStacktrace('Get SDK Token', 'RESPONSE', nowRequest, response.data, req.session.stacktrace);
        const sdkToken = response.data.token;

        const applicant = (req.session.applicant)?req.session.applicant:null;
        const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
        const applicants = (req.session.applicants)?req.session.applicants:[];
        const documents = (req.session.documents)?req.session.documents:[];
        const photos = (req.session.photos)?req.session.photos:[];
        const videos = (req.session.videos)?req.session.videos:[];
        res.render('sdk', { applicants: applicants, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos, sdkToken: sdkToken, showSdkEvents: true });
    })
    .catch((error) => {console.log(error.message);next(error);});
};

exports.initCheck = function(req, res, next) {
    req.session.url = req.originalUrl;
    req.session.check = null;
    const applicant = (req.session.applicant)?req.session.applicant:null;
    const applicants = (req.session.applicants)?req.session.applicants:[];
    const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
    const documents = (req.session.documents)?req.session.documents:[];
    const photos = (req.session.photos)?req.session.photos:[];
    const videos = (req.session.videos)?req.session.videos:[];
    res.render('check', { applicants: applicants, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos, check: null });
};

exports.createCheck = function(req, res, next) {
    // res.send(JSON.stringify(req.body));
    req.session.url = req.originalUrl;
    const applicant = (req.session.applicant)?req.session.applicant:null;    
    const reportNames = Array.isArray(req.body.reports)?req.body.reports:[req.body.reports];

    const data = { 
        applicant_id: applicant.id,
        report_names: reportNames,
        // asynchronous: true,
        // tags: null,
        // document_ids: null
    };
    const nowRequest = logInStacktrace('Create Check', 'REQUEST', null, data, req.session.stacktrace);
    
    axios.default.post('/checks/', data).then((response) => {
        
        logInStacktrace('Create Check', 'RESPONSE', nowRequest, response.data, req.session.stacktrace);
        const check = response.data;

        res.redirect('/checks/'+check.id);
    })
    .catch((error) => {console.log(error.message);next(error);});
};

exports.retrieveCheck = function(req, res, next) {
    // res.send(JSON.stringify(req.body));
    req.session.url = req.originalUrl;
    const check_id = req.params.id;   
    
    const data = { id: check_id };
    const nowRequest = logInStacktrace('Retrieve Check', 'REQUEST', null, data, req.session.stacktrace);
    axios.default.get('/checks/'+check_id).then((response) => {
        
        logInStacktrace('Retrieve Check', 'RESPONSE', nowRequest, response.data, req.session.stacktrace);
        const check = response.data;
        req.session.check = check;

        // GET REPORTS
        function fnRetrieveReport(report_id) {
            const data = { id: report_id };
            const nowRequest = logInStacktrace('Retrieve Report', 'REQUEST', null, data, req.session.stacktrace);
            return axios.default.get('/reports/'+report_id).then((response) => {
                logInStacktrace('Retrieve Report', 'RESPONSE', nowRequest, response.data, req.session.stacktrace);
                return response.data;
            });
        }

        const promises = check.report_ids.map(report_id => Promise.resolve(fnRetrieveReport(report_id)));
        
        Promise.all(promises).then((reports) => {
            req.session.reports = reports;

            const applicant = (req.session.applicant)?req.session.applicant:null;
            const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
            const applicants = (req.session.applicants)?req.session.applicants:[];
            const documents = (req.session.documents)?req.session.documents:[];
            const photos = (req.session.photos)?req.session.photos:[];
            const videos = (req.session.videos)?req.session.videos:[];
            res.render('check', { applicants: applicants, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos, check: check, reports: reports });
        });
    })
    .catch((error) => {console.log(error.message);next(error);});
};

exports.listChecks = function(req, res, next) {
    req.session.url = req.originalUrl;
    const applicant_id = req.session.applicant.id;

    const data = { id: applicant_id };
    const nowRequest = logInStacktrace('List Checks', 'REQUEST', null, data, req.session.stacktrace);

    axios.default.get('/checks?applicant_id='+applicant_id).then((response) => {

        logInStacktrace('List Checks', 'RESPONSE', nowRequest, response.data, req.session.stacktrace);

        const enhancedCheck = function(check) {
            return axios.default.get('/reports?check_id='+check.id).then(response => {
                check['reports'] = response.data.reports;
                return check;
            });
        }

        const checks = response.data.checks.map(check => enhancedCheck(check));
        Promise.all(checks).then(checks => {
            const applicant = (req.session.applicant)?req.session.applicant:null;
            const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
            const applicants = (req.session.applicants)?req.session.applicants:[];
            const documents = (req.session.documents)?req.session.documents:[];
            const photos = (req.session.photos)?req.session.photos:[];
            const videos = (req.session.videos)?req.session.videos:[];
            res.render('checks', { applicants: applicants, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos, checks: checks});
        });
    })
    .catch((error) => {console.log(error.message);next(error);});
};

exports.retrieveReport = function(req, res, next) {
    req.session.url = req.originalUrl;
    const report_id = req.params.id;   
    
    const data = { id: report_id };
    const nowRequest = logInStacktrace('Retrieve Report', 'REQUEST', null, data, req.session.stacktrace);
    
    axios.default.get('/reports/'+report_id).then((response) => {
        logInStacktrace('Retrieve Report', 'RESPONSE', nowRequest, response.data, req.session.stacktrace);
        const report = response.data;
        
        const applicant = (req.session.applicant)?req.session.applicant:null;
        const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
        const applicants = (req.session.applicants)?req.session.applicants:[];
        const documents = (req.session.documents)?req.session.documents:[];
        const photos = (req.session.photos)?req.session.photos:[];
        const videos = (req.session.videos)?req.session.videos:[];
        res.render('report', { applicants: applicants, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos, report: report});
    })
    .catch((error) => {console.log(error.message);next(error);});
};

exports.autofill = function(req, res, next) {
    // res.send(JSON.stringify(req.body));
    req.session.url = req.originalUrl;
    const document_id = req.params.id;    

    const data = { document_id: document_id };
    const nowRequest = logInStacktrace('Autofill', 'REQUEST', null, data, req.session.stacktrace);

    axios.default.post('/extractions', data).then((response) => {

        logInStacktrace('Autofill', 'RESPONSE', nowRequest, response.data, req.session.stacktrace);
        req.session.extraction = response.data;
    })
    .catch((error) => req.session.extraction = error)
    .finally(() => {
        const extraction = (req.session.extraction)?req.session.extraction:null;
        const applicant = (req.session.applicant)?req.session.applicant:null;
        const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
        const applicants = (req.session.applicants)?req.session.applicants:[];
        const documents = (req.session.documents)?req.session.documents:[];
        const photos = (req.session.photos)?req.session.photos:[];
        const videos = (req.session.videos)?req.session.videos:[];
        res.render('autofill', { applicants: applicants, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos, document_id: document_id, extraction: extraction });
    });
};

// TODO TGA LATER: USE CASE
exports.configureUseCase = function(req, res, next) {
    req.session.url = req.originalUrl;
    req.session.usecase = null;
    req.session.current_index = null;
    const applicant = (req.session.applicant)?req.session.applicant:null;
    const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
    const documents = (req.session.documents)?req.session.documents:[];
    const photos = (req.session.photos)?req.session.photos:[];
    const videos = (req.session.videos)?req.session.videos:[];
    res.render('configure_usecase', { applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos });
};

exports.generateUseCase = function(req, res, next) {
    req.session.url = req.originalUrl;

    const steps = (req.body.steps)?req.body.steps:'joined';
    const async = (req.body.async)?req.body.async:'continue';
    const video_capture = (req.body.video_capture)?true:false;
    const known_faces = (req.body.known_faces)?true:false;
    const autofill = (req.body.autofill)?true:false;

    // generate use case based on selected options
    let usecase = {
        steps: [],
        async: async
    };

    let index = 0;
    switch (steps) {
        case 'separated':
            usecase.steps.push({index: index, view: 'step_previous', route: 'previous', process_name: 'Account creation'});
            usecase.steps.push({index: ++index, view: 'step_capture', route: 'capture', process_name: 'Account creation', options: {video_capture: video_capture, autofill: autofill}});
            if(autofill){
                usecase.steps.push({index: ++index, view: 'step_autofill', route: 'autofill', process_name: 'Account creation'});
            }
            usecase.steps.push({index: ++index, view: 'step_next', route: 'next', process_name: 'Account creation'});
            usecase.steps.push({index: ++index, view: 'step_previous', route: 'previous', process_name: 'First transaction to secure'});
            usecase.steps.push({index: ++index, view: 'step_check', route: 'check', process_name: 'First transaction to secure', options: {known_faces: known_faces}});
            if(async == 'wait_and_continue') {
                usecase.steps.push({index: ++index, view: 'step_wait', route: 'wait', process_name: 'First transaction to secure'});
            }
            usecase.steps.push({index: ++index, view: 'step_next', route: 'next', process_name: 'First transaction to secure'});
            break;
        case 'joined':
        default:
            usecase.steps.push({index: index, view: 'step_previous', route: 'previous', process_name: 'First transaction to secure (it can be account creation)'});
            usecase.steps.push({index: ++index, view: 'step_capture', route: 'capture', process_name: 'First transaction to secure (it can be account creation)', options: {video_capture: video_capture, autofill: autofill}});
            if(autofill){
                usecase.steps.push({index: ++index, view: 'step_autofill', route: 'autofill', process_name: 'First transaction to secure (it can be account creation)'});
            }
            usecase.steps.push({index: ++index, view: 'step_check', route: 'check', process_name: 'First transaction to secure (it can be account creation)', options: {known_faces: known_faces}});
            if(async == 'wait_and_continue') {
                usecase.steps.push({index: ++index, view: 'step_wait', route: 'wait', process_name: 'First transaction to secure (it can be account creation)'});
            }
            usecase.steps.push({index: ++index, view: 'step_next', route: 'next', process_name: 'First transaction to secure (it can be account creation)'});
            break;
    }

    req.session.usecase = usecase;
    const current_index = 0;
    req.session.current_index = current_index;
        
    console.log('usecase:', JSON.stringify(usecase, null, 4));
    const applicant = (req.session.applicant)?req.session.applicant:null;
    const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
    const documents = (req.session.documents)?req.session.documents:[];
    const photos = (req.session.photos)?req.session.photos:[];
    const videos = (req.session.videos)?req.session.videos:[];
    res.render('step_previous', { current_index: current_index, usecase: usecase, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos });
};

exports.captureUseCase = function(req, res, next) {
    req.session.url = req.originalUrl;
    const usecase = (req.session.usecase)?req.session.usecase:null;
    const current_index = (Number.isInteger(req.session.current_index))?parseInt(req.session.current_index,10)+1:0;
    req.session.current_index = current_index;

    // get or create applicant
    function getApplicant() {
        return new Promise((successCallback, failureCallback) => {
            if (req.session.applicant != null) {
                successCallback(req.session.applicant);
            }
            else  {
                const data = { first_name: 'Jane', last_name: 'Doe' };
                const nowRequest = logInStacktrace('Create Applicant', 'REQUEST', null, data, req.session.stacktrace);
                axios.default.post('/applicants/', data).then((response) => {
                    logInStacktrace('Create Applicant', 'RESPONSE', nowRequest, response.data, req.session.stacktrace);
                    const applicant = response.data;
                    req.session.applicant = applicant;
                    successCallback(applicant);
                });
            }
        })
    }

    console.log('current index: ', current_index);
    console.log('usecase: ', usecase);
    
    //get SDK Token
    getApplicant().then(applicant => {
        const data = { applicant_id: applicant.id, referrer: '*://*/*' };
        const nowRequest = logInStacktrace('Get SDK Token', 'REQUEST', null, data, req.session.stacktrace);
        axios.default.post('/sdk_token/', data).then((response) => {
            logInStacktrace('Get SDK Token', 'RESPONSE', nowRequest, response.data, req.session.stacktrace);
            const sdkToken = response.data.token;
            
            const applicant = (req.session.applicant)?req.session.applicant:null;
            const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
            const documents = (req.session.documents)?req.session.documents:[];
            const photos = (req.session.photos)?req.session.photos:[];
            const videos = (req.session.videos)?req.session.videos:[];
            res.render('step_capture', { current_index: current_index, usecase: usecase, sdkToken: sdkToken, showSdkEvents: true, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos});
        });
    })
    .catch((error) => {console.log(error.message);next(error);})
};

exports.refreshApplicantAfterCapture = function(req, res, next) {
    const applicant_id = req.params.id;
    const applicant = axios.default.get('/applicants/'+applicant_id);
    const documents = axios.default.get('/documents?applicant_id='+applicant_id).then(response => response.data.documents);
    const photos = axios.default.get('/live_photos?applicant_id='+applicant_id).then(response => response.data.live_photos);
    const videos = axios.default.get('/live_videos?applicant_id='+applicant_id).then(response => response.data.live_videos);
    
    Promise.all([applicant, documents, photos, videos]).then((children) => {
        req.session.applicant = children[0];
        req.session.documents = children[1];
        req.session.photos = children[2];
        req.session.videos = children[3];
    })
    .catch((error) => {console.log(error.message);next(error);});

    const redirect_url = (req.query.next)?req.query.next:'/usecases/step_next';
    res.redirect(redirect_url);
};

exports.autofillUsecase = function(req, res, next) {
    const applicant_id = req.session.applicant.id;
    req.session.url = req.originalUrl;
    const usecase = (req.session.usecase)?req.session.usecase:null;
    const current_index = (Number.isInteger(req.session.current_index))?parseInt(req.session.current_index,10)+1:0;
    req.session.current_index = current_index;
    
    const applicant = axios.default.get('/applicants/'+applicant_id);
    const documents = axios.default.get('/documents?applicant_id='+applicant_id).then(response => response.data.documents);
    const photos = axios.default.get('/live_photos?applicant_id='+applicant_id).then(response => response.data.live_photos);
    const videos = axios.default.get('/live_videos?applicant_id='+applicant_id).then(response => response.data.live_videos);
    
    Promise.all([applicant, documents, photos, videos]).then((children) => {
        req.session.applicant = children[0];
        req.session.documents = children[1];
        req.session.photos = children[2];
        req.session.videos = children[3];
    })
    .then(() => {
        const front_document = req.session.documents.find(document => document.side == 'front');
        const data = { document_id: front_document.id };
        const nowRequest = logInStacktrace('Autofill', 'REQUEST', null, data, req.session.stacktrace);
        return axios.default.post('/extractions', data).then((response) => {
            logInStacktrace('Autofill', 'RESPONSE', nowRequest, response.data, req.session.stacktrace);
            req.session.extraction = response.data;
        })
        .catch((error) => {
            req.session.extraction = error;
        });
    })
    .then(() => {
        if(req.session.extraction.extracted_data){
            const data = { first_name: req.session.extraction.extracted_data.first_name, last_name: req.session.extraction.extracted_data.last_name };
            const nowRequest = logInStacktrace('Update Applicant', 'REQUEST', null, data, req.session.stacktrace);
            return axios.default.put('/applicants/'+applicant_id, data).then((response) => {
                logInStacktrace('Update Applicant', 'RESPONSE', nowRequest, response.data, req.session.stacktrace);
                req.session.applicant = response.data;
            });
        }
    })
    .catch((error) => console.log(error.message))
    .finally(() => {
        const extraction = (req.session.extraction)?req.session.extraction:null;
        const applicant = (req.session.applicant)?req.session.applicant:null;
        const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
        const documents = (req.session.documents)?req.session.documents:[];
        const photos = (req.session.photos)?req.session.photos:[];
        const videos = (req.session.videos)?req.session.videos:[];
        res.render('step_autofill', { extraction: extraction, current_index: current_index, usecase: usecase, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos });
    });
};

exports.checkUseCase = function(req, res, next) {
    req.session.url = req.originalUrl;
    const usecase = (req.session.usecase)?req.session.usecase:null;
    const current_index = (Number.isInteger(req.session.current_index))?parseInt(req.session.current_index,10)+1:0;
    req.session.current_index = current_index;

    const applicant = (req.session.applicant)?req.session.applicant:null;
    const reportNames = [
        'document',
        (usecase.video_capture)?'facial_similarity_video':'facial_similarity_photo_fully_auto'
    ];
    if(usecase.known_faces) {
        reportNames.push('known_faces');
    }
    const data = { 
        applicant_id: applicant.id,
        report_names: reportNames
    };
    const nowRequest = logInStacktrace('Create Check', 'REQUEST', null, data, req.session.stacktrace);
    
    axios.default.post('/checks/', data).then((response) => {
        logInStacktrace('Create Check', 'RESPONSE', nowRequest, response.data, req.session.stacktrace);
        const check = response.data;
        req.session.check = check;

        const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
        const documents = (req.session.documents)?req.session.documents:[];
        const photos = (req.session.photos)?req.session.photos:[];
        const videos = (req.session.videos)?req.session.videos:[];

        res.render('step_check', { check: check, current_index: current_index, usecase: usecase, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos});
    })
    .catch((error) => {console.log(error.message);next(error);});

};

exports.waitUseCase = function(req, res, next) {
    req.session.url = req.originalUrl;
    const usecase = (req.session.usecase)?req.session.usecase:null;
    const current_index = (Number.isInteger(req.session.current_index))?parseInt(req.session.current_index,10)+1:0;
    req.session.current_index = current_index;
    const viewresult = (req.query.viewresult)?(req.query.viewresult == 'true'):false;
    const check = (req.session.check)?req.session.check:null;

    if(viewresult) {
        getAllResourcesByCheck(check.id).then(check => {
            res.render(usecase.steps[current_index].view, { check: check, viewresult: viewresult, current_index: current_index, usecase: usecase, applicant: check.applicant, stacktrace: stacktrace, documents: check.applicant.documents, photos: check.applicant.photos, videos: check.applicant.videos});
        });
    } else { 
        const applicant = (req.session.applicant)?req.session.applicant:null;
        const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
        const documents = (req.session.documents)?req.session.documents:[];
        const photos = (req.session.photos)?req.session.photos:[];
        const videos = (req.session.videos)?req.session.videos:[];
        res.render('step_wait', { check: check, viewresult: viewresult, current_index: current_index, usecase: usecase, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos});
    }
    
};

exports.nextUseCase = function(req, res, next) {
    req.session.url = req.originalUrl;
    const usecase = (req.session.usecase)?req.session.usecase:null;
    const current_index = (Number.isInteger(req.session.current_index))?parseInt(req.session.current_index,10)+1:0;
    req.session.current_index = current_index;

    // TODO: create next page
    
    const applicant = (req.session.applicant)?req.session.applicant:null;
    const stacktrace = (req.session.stacktrace)?req.session.stacktrace:[];
    const documents = (req.session.documents)?req.session.documents:[];
    const photos = (req.session.photos)?req.session.photos:[];
    const videos = (req.session.videos)?req.session.videos:[];
    res.render('step_next', { current_index: current_index, usecase: usecase, applicant: applicant, stacktrace: stacktrace, documents: documents, photos: photos, videos: videos});
};