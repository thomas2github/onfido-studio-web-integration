$(document).ready(function() {
    // update & reset language
    $('#udpateCustomLanguage').click(function(){
        $('#customLanguage').val($('#customLanguageEditor').val());
    });
    $('#resetCustomLanguage').click(function(){
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
        const forceCrossDevice = $('#forceCrossDevice').is(':checked');
        const useLiveDocumentCapture = $('#useLiveDocumentCapture').is(':checked');
        const acceptPassport = $('#acceptPassport').is(':checked');
        const acceptNationalId = $('#acceptNationalId').is(':checked');
        const acceptDrivingLicence = $('#acceptDrivingLicence').is(':checked');
        const acceptResidencePermit = $('#acceptResidencePermit').is(':checked');
        const acceptOthers = $('#acceptOthers').is(':checked');
        const showCountrySelection = $('#showCountrySelection').is(':checked');
        const language = $('#languageFR').is(':checked')?$('#languageFR').val():($('#languageES').is(':checked')?$('#languageES').val():($('#languageDE').is(':checked')?$('#languageDE').val():($('#languageIT').is(':checked')?$('#languageIT').val():($('#languagePT').is(':checked')?$('#languagePT').val():$('#languageEN').val()))));

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
        // CUSTOM UI
        let customUI = ($('#customUI').val()!='')?JSON.parse($('#customUI').val()):'';

        let onfidoSdk;
        const token = $(this).attr('data-token');
        const applicantId = $(this).attr('data-applicant-id');
        const workflowRunId = $(this).attr('data-workflow-run-id');

        let sdkParam = {
            useModal: useModal,
            language: language,
            customUI: customUI,
            token: token,
            workflowRunId: workflowRunId,
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
                window.location = '/workflow-runs/'+workflowRunId;
            },
        };
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