$(document).ready(function() {
    // update & reset language
    $('#udpateCustomLanguage').click(function(){
        $('#customLanguage').val($('#customLanguageEditor').val());
    });
    $('#resetCustomLanguage').click(function(){
        document.location.reload();
    });

    // update & reset steps
    $('#udpateCustomSteps').click(function(){
        $('#customSteps').val($('#customStepsEditor').val());
    });
    $('#resetCustomSteps').click(function(){
        document.location.reload();
    });

    // update & reset customUI
    $('#udpateCustomUI').click(function(){
        $('#customUI').val($('#customUIEditor').val());
    });
    $('#resetCustomUI').click(function(){
        document.location.reload();
    });


    // Init & display Onfido web SDK ID Document
    $('#dislpaySdk').click(function(){
        
        $('.onfido-sdk-ui-Modal-inner').remove();
        const useModal = $('#useModal').is(':checked');
        const welcomeStep = $('#welcomeStep').is(':checked');
        const completeStep = $('#completeStep').is(':checked');
        const hideOnfidoLogo = $('#hideOnfidoLogo').is(':checked');
        const documentStep = $('#documentStep').is(':checked');
        const documentVideoStep = $('#documentVideoStep').is(':checked');
        const selfieStep = $('#selfieStep').is(':checked');
        const videoStep = $('#videoStep').is(':checked');
        const poaStep = $('#poaStep').is(':checked');
        const forceCrossDevice = $('#forceCrossDevice').is(':checked');
        const useLiveDocumentCapture = $('#useLiveDocumentCapture').is(':checked');
        const acceptPassport = $('#acceptPassport').is(':checked');
        const acceptNationalId = $('#acceptNationalId').is(':checked');
        const acceptDrivingLicence = $('#acceptDrivingLicence').is(':checked');
        const acceptResidencePermit = $('#acceptResidencePermit').is(':checked');
        const acceptOthers = $('#acceptOthers').is(':checked');
        const showCountrySelection = $('#showCountrySelection').is(':checked');
        const language = $('#languageFR').is(':checked')?$('#languageFR').val():($('#languageES').is(':checked')?$('#languageES').val():($('#languageDE').is(':checked')?$('#languageDE').val():($('#languageIT').is(':checked')?$('#languageIT').val():($('#languagePT').is(':checked')?$('#languagePT').val():$('#languageEN').val()))));

        let steps = [];
        if (documentStep) {
            
            steps.push(
                {
                    type: 'document',
                    options: {
                        // requestedVariant: 'video',
                        forceCrossDevice: forceCrossDevice,
                        useLiveDocumentCapture: useLiveDocumentCapture,
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
        if (documentVideoStep) {
            
            steps.push(
                {
                    type: 'document',
                    options: {
                        requestedVariant: 'video',
                        forceCrossDevice: forceCrossDevice,
                        useLiveDocumentCapture: false,
                        uploadFallback: true,
                        useWebcam: false,
                        documentTypes: {
                            passport: acceptPassport,
                            driving_licence: acceptDrivingLicence,
                            national_identity_card: acceptNationalId,
                            residence_permit: acceptResidencePermit
                        },
                        showCountrySelection: false
                    }
                }
            );
        }
        if (selfieStep) {
            steps.push(
                {
                    type: 'face',
                    // options: {
                    //     requestedVariant: 'standard',
                    //     useMultipleSelfieCapture: true,
                    //     uploadFallback: true
                    // }
                }
            );
        }
        if (videoStep) {
            steps.push(
                {
                    type: 'face',
                    options: {
                        requestedVariant: 'video',
                        // useMultipleSelfieCapture: true,
                        uploadFallback: false, 
                        photoCaptureFallback: false
                        // forceCrossDevice: true
                    }
                }
            );
        }
        if (poaStep) {
            steps.push(
                {
                    type: 'poa',
                    options: {
                        'country': 'GBR',
						'documentTypes': {
							'bank_building_society_statement': true,
							'utility_bill': true,
							'council_tax': true,
							'benefit_letters': true,
							'government_letter': true
                        }
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
        
        
        // CUSTOM LANGUAGE
        let customLanguage = ($('#customLanguage').val()!='')?JSON.parse($('#customLanguage').val()):'';
        // CUSTOM STEPS
        let customSteps = ($('#customSteps').val()!='')?JSON.parse($('#customSteps').val()):'';
        // CUSTOM UI
        let customUI = ($('#customUI').val()!='')?JSON.parse($('#customUI').val()):'';

        let onfidoSdk;
        const token = $(this).attr('data-token');
        const applicantId = $(this).attr('data-applicant-id');

        let sdkParam = {
            useModal: useModal,
            // shouldCloseOnOverlayClick: true,
            language: language,
            // language: {
            //     locale: 'en_US',
            //     phrases: { doc_select: { button_permit: 'National Health Insurance Card' } }
            // },
            // disableAnalytics: false,
            // useMemoryHistory: false,
            steps: steps,
            // steps: ['document','document'],
            // mobileFlow: false,
            // enterpriseFeatures: {
            //     hideOnfidoLogo: hideOnfidoLogo,
            //     cobrand: null
            // },
            customUI: customUI,
            token: token,
            containerId: 'onfido-mount',
            isModalOpen: true,
            onModalRequestClose: function() {
                // Update options with the state of the modal
                onfidoSdk.setOptions({isModalOpen: false})
            },
            onComplete: function(data) {
                console.log(JSON.stringify(data));
                row = '<tbody><tr data-toggle="toggle" data-ol-has-click-handler><td>' + 'on complete' + '</td><td>' +  + '</td></tr></tbody>';
                row += '<tbody><tr><td colspan="2"><pre>' + JSON.stringify(data) + '</td></tr></tbody>';
                $('#sdk-events').append(row);
                alert(JSON.stringify(data)); //NOT FOR PRODUCTION: display data with document and photo ids
                window.location = '/applicants/'+applicantId;
            },
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

    // display sdk events
    window.addEventListener('userAnalyticsEvent', (event) => {
        console.log(event);
        row = '<tbody><tr><td>' + event.detail.eventName + '</td><td>' + Math.floor(event.timeStamp) + '</td></tr><tr><td colspan="2"><pre>' + JSON.stringify(event.detail) + '</td></tr></tbody>';
        // alert(JSON.stringify(event.detail));
        $('#sdk-events').append(row);
    });
});