$(document).ready(function() {

    // Clicable link on table row
    $('table tr.js-clickable, .card.js-clickable').click(function(){
        window.location = $(this).attr('href');
        return false;
    });

    // Go back
    $('.goback').click(function() {
        history.go(-1);        
        return false;
    });

    // display web uplaod
    $('.js-showWebUpload').click(function(){
        $('#webUpload').show();
        $('#onfidoWebSdk').hide();
        return false;
    });

    // Init & display Onfido web SDK
    $('.js-showOnfidoWebSdk').click(function(){
        $('#onfidoWebSdk').show();
        $('#webUpload').hide();
        $('.onfido-sdk-ui-Modal-inner').remove();
        const applicantId = $(this).attr('data-applicant-id');
        const useModal = $('#useModal').is(":checked");
        const welcomeStep = $('#welcomeStep').is(":checked");
        const forceCrossDevice = $('#forceCrossDevice').is(":checked");
        const useMultipleSelfieCapture = $('#useMultipleSelfieCapture').is(":checked");
        let onfidoSdk;
        let sdkParam = {
            token: $(this).attr('data-token'),
            containerId: 'onfido-mount',
            useModal: useModal,
            isModalOpen: true,
            onModalRequestClose: function() {
                // Update options with the state of the modal
                onfidoSdk.setOptions({isModalOpen: false})
            },
            onComplete: function(data) {
                window.location = '/resources/applicants/' + applicantId;
            },
            steps: [
                {
                    type: 'face',
                    options: {
                        forceCrossDevice: forceCrossDevice,
                        requestedVariant: 'video',
                        useMultipleSelfieCapture: useMultipleSelfieCapture,
                        uploadFallback: false
                    }
                }
            ]
        };
        welcomeParam = {
            type: 'welcome',
            options: {
                title: 'Welcome on web sdk demo',
                descriptions: ['live video capture with options: ']
            }
        };
        if (useModal) {
            welcomeParam.options.descriptions.push(' > display in modal <');
        }
        if (welcomeStep) {
            welcomeParam.options.descriptions.push(' > add welcome step <');
        }
        if (useMultipleSelfieCapture) {
            welcomeParam.options.descriptions.push(' > take additional selfie snapshots <');
        }
        if (welcomeStep) {
            sdkParam.steps.unshift(welcomeParam);
        }
        
        onfidoSdk = Onfido.init(sdkParam);
        return false;
    });
});