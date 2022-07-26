$(document).ready(function() {

    // update & reset language
    $('#udpateCustomLanguage').click(function(){
        $('#customLanguage').val($('#customLanguageEditor').val());
        initSDk();
    });
    $('#resetCustomLanguage').click(function(){
        $('#customLanguage').val('{}');
        initSDk();
    });

    // update & reset customUI
    $('#udpateCustomUI').click(function(){
        $('#customUI').val($('#customUIEditor').val());
        initSDk();
    });
    $('#resetCustomUI').click(function(){
        $('#customUI').val('');
        initSDk();
    });

    initSDk();
    
});

function initSDk() {
    // Init & display Onfido web SDK ID Document        
    $('.onfido-sdk-ui-Modal-inner').remove();
    const useModal = false;
    // const language = 'fr';

    // CUSTOM LANGUAGE
    let customLanguage = ($('#customLanguage').val()!='')?JSON.parse($('#customLanguage').val()):'';
    // CUSTOM UI
    let customUI = ($('#customUI').val()!='')?JSON.parse($('#customUI').val()):'';

    let onfidoSdk;
    const token = $('#onfido-mount').attr('data-token');
    const workflowRunId = $('#onfido-mount').attr('data-workflow-run-id');

    let sdkParam = {
        useModal: useModal,
        language: customLanguage,
        token: token,
        workflowRunId: workflowRunId,
        containerId: 'onfido-mount',
        customUI: customUI,
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
        },
    };
    console.log('sdkconfig: ', sdkParam);
    onfidoSdk = Onfido.init(sdkParam);
    return true;
};
