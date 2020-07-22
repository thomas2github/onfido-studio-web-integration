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
        $('#onfidoWebSdkPoa').hide();
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
        const useLiveDocumentCapture = false; // $('#useLiveDocumentCapture').is(":checked");
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
                    type: 'document',
                    options: {
                        forceCrossDevice: forceCrossDevice,
                        useLiveDocumentCapture: useLiveDocumentCapture,
                        uploadFallback: true
                    }
                }
            ]
        };
        welcomeParam = {
            type: 'welcome',
            options: {
                title: 'Welcome on web sdk demo',
                descriptions: ['id document capture with options: '],
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
        if (useLiveDocumentCapture) {
            welcomeParam.options.descriptions.push(' > live document capture <');
        }
        if (welcomeStep) {
            sdkParam.steps.unshift(welcomeParam);
        }
        
        onfidoSdk = Onfido.init(sdkParam);
        return false;
    });

    // Init & display Onfido web SDK POA
    $('.js-showOnfidoWebSdkPoa').click(function(){
        $('#onfidoWebSdkPoa').show();
        $('#webUpload').hide();
        $('#onfidoWebSdk').show();
        $('.onfido-sdk-ui-Modal-inner').remove();
        const applicantId = $(this).attr('data-applicant-id');
        const useModal = $('#useModal').is(":checked");
        const welcomeStep = $('#welcomeStep').is(":checked");
        const forceCrossDevice = $('#forceCrossDevice').is(":checked");
        const useLiveDocumentCapture = false; //$('#useLiveDocumentCapture').is(":checked");
        let onfidoSdk;
        let sdkParam = {
            token: $(this).attr('data-token'),
            containerId: 'onfido-mount-poa',
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
                    type: 'poa',
                    options: {
                        country: 'FRA'
                    }
                }
            ]
        };
        welcomeParam = {
            type: 'welcome',
            options: {
                title: 'Welcome on web sdk demo',
                descriptions: ['proof of address document capture with options: '],
                nextButton: 'capture proof of address'
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
        if (useLiveDocumentCapture) {
            welcomeParam.options.descriptions.push(' > live document capture <');
        }
        if (welcomeStep) {
            sdkParam.steps.unshift(welcomeParam);
        }
        
        onfidoSdk = Onfido.init(sdkParam);
        return false;
    });
});