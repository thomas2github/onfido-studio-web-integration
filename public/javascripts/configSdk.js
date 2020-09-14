$(document).ready(function() {

    // Init & display Onfido web SDK ID Document
    $('#dislpaySdk').click(function(){
        $('.onfido-sdk-ui-Modal-inner').remove();
        const useModal = $('#useModal').is(":checked");
        const welcomeStep = $('#welcomeStep').is(":checked");
        const forceCrossDevice = $('#forceCrossDevice').is(":checked");
        const useLiveDocumentCapture = false; // $('#useLiveDocumentCapture').is(":checked");
        const documentStep = $('#documentStep').is(":checked");
        const selfieStep = $('#selfieStep').is(":checked");
        const videoStep = $('#videoStep').is(":checked");
        const completeStep = $('#completeStep').is(":checked");
        let steps = [];
        if (documentStep) {
            steps.push(
                {
                    type: 'document',
                    options: {
                        forceCrossDevice: forceCrossDevice,
                        useLiveDocumentCapture: useLiveDocumentCapture,
                        uploadFallback: true
                    }
                }
            );
        }
        if (selfieStep) {
            steps.push(
                {
                    type: 'face',
                    options: {
                        forceCrossDevice: forceCrossDevice,
                        requestedVariant: 'standard',
                        useMultipleSelfieCapture: true,
                        uploadFallback: true
                    }
                }
            );
        }
        if (videoStep) {
            steps.push(
                {
                    type: 'face',
                    options: {
                        forceCrossDevice: forceCrossDevice,
                        requestedVariant: 'video',
                        useMultipleSelfieCapture: true,
                        uploadFallback: true
                    }
                }
            );
        }
        if (completeStep) {
            steps.push(
                {
                    type: 'complete',
                    options: {
                    }
                }
            );
        }
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
                window.location = '/web-sdk-configuration';
            },
            steps: steps
        };
        welcomeParam = {
            type: 'welcome',
            options: {
                title: 'Welcome on COMPTE NICKEL web sdk demo',
                descriptions: ['sdk capture with options: '],
                nextButton: 'start COMPTE NICKEL capture'
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
        if (documentStep) {
            welcomeParam.options.descriptions.push(' > document capture <');
        }
        if (selfieStep) {
            welcomeParam.options.descriptions.push(' > selfie capture <');
        }
        if (videoStep) {
            welcomeParam.options.descriptions.push(' > video capture <');
        }
        if (completeStep) {
            welcomeParam.options.descriptions.push(' > add complete message <');
        }
        if (welcomeStep) {
            sdkParam.steps.unshift(welcomeParam);
        }
        
        onfidoSdk = Onfido.init(sdkParam);
        return false;
    });

    // $('#refreshSdk').click();

});