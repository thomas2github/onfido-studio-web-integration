$(document).ready(function() {

    // Init & display Onfido web SDK ID Document
    $('#dislpaySdk').click(function(){
        $('.onfido-sdk-ui-Modal-inner').remove();
        const useModal = $('#useModal').is(':checked');
        const welcomeStep = $('#welcomeStep').is(':checked');
        const forceCrossDevice = $('#forceCrossDevice').is(':checked');
        const useLiveDocumentCapture = $('#useLiveDocumentCapture').is(':checked');
        const useWebcam = false; // $('#useWebcam').is(':checked');
        const documentStep = $('#documentStep').is(':checked');
        const selfieStep = $('#selfieStep').is(':checked');
        const videoStep = $('#videoStep').is(':checked');
        const completeStep = $('#completeStep').is(':checked');
        const acceptPassport = $('#acceptPassport').is(':checked');
        const acceptNationalId = $('#acceptNationalId').is(':checked');
        const acceptDrivingLicence = $('#acceptDrivingLicence').is(':checked');
        const acceptResidencePermit = $('#acceptResidencePermit').is(':checked');
        const showCountrySelection = $('#showCountrySelection').is(':checked');
        const language = $('#language').is(':checked') ? 'fr_FR' : 'en_US';

        // const language = {
        //     locale: 'pt_PT',
        //     phrases: { 
        //         capture: {
        //             national_identity_card: {
        //                 back: {
        //                     instructions: "Carregue o verso do cartão de seu computador",
        //                     title: "Envie a carteira de identidade (verso)",
        //                     webcam: "Posicione o verso do cartão na moldura (será detectado automaticamente)"
        //                 },
        //                 front: {
        //                     instructions: "Carregue a frente do cartão de seu computador",
        //                     title: "Envie a carteira de identidade (frente) ",
        //                     webcam: "Posicione a frente do cartão no porta-retratos (será detectado automaticamente)"
        //                 }
        //             },
        //             passport: {
        //                 front: {
        //                     instructions: "Carregue a página da foto do passaporte de seu computador",
        //                     title: "Envie a página da foto do passaporte",
        //                     webcam: "Posicione a página da foto do seu passaporte no porta-retratos (será detectado automaticamente)"
        //                 }
        //             }
        //         }
        //     }
        // };        

        let steps = [];
        if (documentStep) {
            steps.push(
                {
                    type: 'document',
                    options: {
                        forceCrossDevice: forceCrossDevice,
                        useLiveDocumentCapture: useLiveDocumentCapture,
                        useWebcam: useWebcam,
                        uploadFallback: true,
                        documentTypes: {
                            passport: acceptPassport,
                            driving_licence: acceptDrivingLicence,
                            national_identity_card: acceptNationalId,
                            residence_permit: acceptResidencePermit
                        },
                        showCountrySelection: showCountrySelection
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
            language: language,
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
                title: 'Welcome on Onfido web sdk demo',
                descriptions: ['sdk capture with options: '],
                nextButton: 'start Onfido capture'
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
        console.log('sdkconfig: ', sdkParam);
        onfidoSdk = Onfido.init(sdkParam);
        return false;
    });

    // $('#refreshSdk').click();

});