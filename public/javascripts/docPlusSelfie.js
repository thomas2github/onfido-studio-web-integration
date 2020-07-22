$(document).ready(function() {

    // Go back
    $('.goback').click(function() {
        history.go(-1);        
        return false;
    });

    // Init & display Onfido web SDK ID Document
    $('.onfido-sdk-ui-Modal-inner').remove();
    const applicantId = $('#onfido-mount').attr('data-applicant-id');
    const useModal = false;
    const welcomeStep = false;
    const forceCrossDevice = false;
    const useLiveDocumentCapture = false;
    const useMultipleSelfieCapture = true;
    let onfidoSdk;
    let sdkParam = {
        token: $('#onfido-mount').attr('data-token'),
        containerId: 'onfido-mount',
        useModal: useModal,
        isModalOpen: true,
        onModalRequestClose: function() {
            // Update options with the state of the modal
            onfidoSdk.setOptions({isModalOpen: false})
        },
        onComplete: function(data) {
            //redirect to create check
            window.location.href = '/usecases/create-doc-plus-selfie-check/' + applicantId;
        },
        steps: [
            {
                type: 'document',
                options: {
                    forceCrossDevice: forceCrossDevice,
                    useLiveDocumentCapture: useLiveDocumentCapture,
                    uploadFallback: true
                }
            },
            {
                type: 'face',
                options: {
                    forceCrossDevice: forceCrossDevice,
                    requestedVariant: 'standard',
                    useMultipleSelfieCapture: useMultipleSelfieCapture,
                    uploadFallback: true
                }
            }
        ]
    };
    // welcomeParam = {
    //     type: 'welcome',
    //     options: {
    //         title: 'Welcome on web sdk demo',
    //         descriptions: ['id document capture with options: '],
    //         nextButton: 'capture ID document'
    //     }
    // };
    // if (useModal) {
    //     welcomeParam.options.descriptions.push(' > display in modal <');
    // }
    // if (welcomeStep) {
    //     welcomeParam.options.descriptions.push(' > add welcome step <');
    // }
    // if (forceCrossDevice) {
    //     welcomeParam.options.descriptions.push(' > capture on mobile device <');
    // }
    // if (useLiveDocumentCapture) {
    //     welcomeParam.options.descriptions.push(' > live document capture <');
    // }
    // if (welcomeStep) {
    //     sdkParam.steps.unshift(welcomeParam);
    // }
    
    onfidoSdk = Onfido.init(sdkParam);
    return false;

    
});