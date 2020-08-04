$(document).ready(function() {

    // Go back
    $('.goback').click(function() {
        history.go(-1);        
        return false;
    });
    
    $('.onfido-sdk-ui-Modal-inner').remove();
    const applicantId = $('#onfido-mount').attr('data-applicant-id');
    let onfidoSdk;
    let sdkParam = {
        token: $('#onfido-mount').attr('data-token'),
        containerId: 'onfido-mount',
        useModal: false,
        onComplete: function(data) {
            window.location = '/resources/applicants/' + applicantId;
        },
        steps: [
            {
                type: 'document',
                options: {
                    forceCrossDevice: false,
                    useLiveDocumentCapture: true,
                    uploadFallback: true
                }
            },
            {
                type: 'face',
                options: {
                    forceCrossDevice: true,
                    requestedVariant: 'standard',
                    uploadFallback: true,
                    useMultipleSelfieCapture: true
                }
            }
        ]
    };
    
    onfidoSdk = Onfido.init(sdkParam);

});