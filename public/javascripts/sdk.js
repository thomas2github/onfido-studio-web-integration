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
        const language = $('#languageFR').is(':checked')?$('#languageFR').val():($('#languageES').is(':checked')?$('#languageES').val():($('#languageDE').is(':checked')?$('#languageDE').val():$('#languageEN').val()));

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
        const token = $(this).attr('data-token');
        const applicantId = $(this).attr('data-applicant-id');
        let sdkParam = {
            token: token,
            containerId: 'onfido-mount',
            language: language,
            useModal: useModal,
            isModalOpen: true,
            onModalRequestClose: function() {
                // Update options with the state of the modal
                onfidoSdk.setOptions({isModalOpen: false})
            },
            onComplete: function(data) {
                window.location = '/applicants/'+applicantId;
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
        if (documentStep) {
            welcomeParam.options.descriptions.push(' > document capture <');
        }
        if (selfieStep) {
            welcomeParam.options.descriptions.push(' > selfie capture <');
        }
        if (videoStep) {
            welcomeParam.options.descriptions.push(' > video capture <');
        }
        if (welcomeStep) {
            sdkParam.steps.unshift(welcomeParam);
        }
        console.log('sdkconfig: ', sdkParam);
        onfidoSdk = Onfido.init(sdkParam);
        return false;
    });

    // $('#refreshSdk').click();
    // TODO: get sdk events

});