$(document).ready(function() {

    // Init & display Onfido web SDK ID Document
    $('.onfido-sdk-ui-Modal-inner').remove();
    // const options = $('#sdk-data').attr('data-options');
    let steps = [];
    steps.push({
        type: 'document',
        options: {
            forceCrossDevice: false,
            useLiveDocumentCapture: false,
            uploadFallback: true,
            documentTypes: {
                passport: true,
                driving_licence: true,
                national_identity_card: true,
                residence_permit: false
            },
            showCountrySelection: true
        }
    });
    steps.push({
        type: 'face',
        options: {
            // requestedVariant: (options.video_capture)?'video':'standard',
            requestedVariant: (options.video_capture)?'video':'standard',
            useMultipleSelfieCapture: true,
            uploadFallback: true
        }
    });
    steps.push({
        type: 'complete'
    });
    let onfidoSdk;
    const token = $('#sdk-data').attr('data-token');
    const applicant_id = $('#sdk-data').attr('data-applicant-id');
    const next_step = $('#sdk-data').attr('data-next-step');
    let sdkParam = {
        useModal: false,
        steps: steps,
        token: token,
        containerId: 'onfido-mount',
        isModalOpen: true,
        onModalRequestClose: function() {
            // Update options with the state of the modal
            onfidoSdk.setOptions({isModalOpen: false})
        },
        onComplete: function(data) {
            window.location = '/applicants/'+applicant_id+'/refresh-after-capture?next=%2Fusecases%2F'+next_step;
        }
    };
    console.log('sdkconfig: ', sdkParam);
    onfidoSdk = Onfido.init(sdkParam);

    // display sdk events
    window.addEventListener('userAnalyticsEvent', (event) => {
        console.log(event);
        row = '<tbody><tr data-toggle="toggle" data-ol-has-click-handler><td>' + event.detail.eventName + '</td><td>' + Math.floor(event.timeStamp) + '</td></tr></tbody>';
        row += '<tbody class="hide" style="display:none;"><tr><td colspan="2"><pre>' + JSON.stringify(event.detail) + '</td></tr></tbody>';
        $('#sdk-events').append(row);
    });
});