$(document).ready(function() {

    // Go back
    $('.goback').click(function() {
        history.go(-1);        
        return false;
    });

    // Init & display Onfido web SDK ID Document
    $('.js-showOnfidoWebSdk').click(function(){
        $('#onfidoWebSdk').show();
        $('#webUpload').hide();
        $('#onfidoWebSdkPoa').show();
        $('.onfido-sdk-ui-Modal-inner').remove();
        const applicantId = $(this).attr('data-applicant-id');
        const useModal = $('#useModal').is(":checked");
        const welcomeStep = $('#welcomeStep').is(":checked");
        const forceCrossDevice = $('#forceCrossDevice').is(":checked");
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
                        uploadFallback: true
                    }
                }
            ]
        };
        welcomeParam = {
            type: 'welcome',
            options: {
                title: 'Welcome on web sdk demo',
                descriptions: ['selfie capture with options: '],
                nextButton: 'capture ID document'
            }
        };
        if (useModal) {
            welcomeParam.options.descriptions.push(' > display in modal <');
        }
        if (welcomeStep) {
            welcomeParam.options.descriptions.push(' > add welcome step <');
        }
        if (forceCrossDevice) {
            welcomeParam.options.descriptions.push(' > capture on mobile device <');
        }
        if (useMultipleSelfieCapture) {
            welcomeParam.options.descriptions.push(' > multi selfie snapshots <');
        }
        if (welcomeStep) {
            sdkParam.steps.unshift(welcomeParam);
        }
        
        onfidoSdk = Onfido.init(sdkParam);
        return false;
    });

    
});