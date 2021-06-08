$(document).ready(function() {
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
        const selfieStep = $('#selfieStep').is(':checked');
        const videoStep = $('#videoStep').is(':checked');
        const authenticateStep = $('#authenticateStep').is(':checked');
        const forceCrossDevice = $('#forceCrossDevice').is(':checked');
        const useLiveDocumentCapture = $('#useLiveDocumentCapture').is(':checked');
        const acceptPassport = $('#acceptPassport').is(':checked');
        const acceptNationalId = $('#acceptNationalId').is(':checked');
        const acceptDrivingLicence = $('#acceptDrivingLicence').is(':checked');
        const acceptResidencePermit = $('#acceptResidencePermit').is(':checked');
        const showCountrySelection = $('#showCountrySelection').is(':checked');
        const language = $('#languageFR').is(':checked')?$('#languageFR').val():($('#languageES').is(':checked')?$('#languageES').val():($('#languageDE').is(':checked')?$('#languageDE').val():$('#languageEN').val()));

        // CUSTOM UI
        const customUI = ($('#customUI').val()!='')?JSON.parse($('#customUI').val()):'';

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
                        // uploadFallback: true
                    }
                }
            );
        }
        if (authenticateStep) {
            steps.push(
                {
                    type: 'auth',
                    options: {
                        retries: 3
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
            useModal: useModal,
            // shouldCloseOnOverlayClick: true,
            language: language,
            // disableAnalytics: false,
            // useMemoryHistory: false,
            steps: steps,
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
                // TODO: display document ids in a popup before redirection
                row = '<tbody><tr data-toggle="toggle" data-ol-has-click-handler><td>' + 'on complete' + '</td><td>' +  + '</td></tr></tbody>';
                row += '<tbody><tr><td colspan="2"><pre>' + JSON.stringify(data) + '</td></tr></tbody>';
                $('#sdk-events').append(row);
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
        row = '<tbody><tr data-toggle="toggle" data-ol-has-click-handler><td>' + event.detail.eventName + '</td><td>' + Math.floor(event.timeStamp) + '</td></tr></tbody>';
        row += '<tbody class="hide" style="display:none;"><tr><td colspan="2"><pre>' + JSON.stringify(event.detail) + '</td></tr></tbody>';
        $('#sdk-events').append(row);
    });
});