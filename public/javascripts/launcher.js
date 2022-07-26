$(document).ready(function() {

    // Init & display Onfido web SDK ID Document
    $('#dislpaySdk').click(function(){
        
        $('.onfido-sdk-ui-Modal-inner').remove();
        const useModal = false;
        const language = 'fr';

        let onfidoSdk;
        const token = $('#onfido-mount').attr('data-token');
        const workflowRunId = $('#onfido-mount').attr('data-workflow-run-id');

        let sdkParam = {
            useModal: useModal,
            language: language,
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
                // alert(JSON.stringify(data));
                // window.location = '/applicants/'+applicantId;
            },
        };
        console.log('sdkconfig: ', sdkParam);
        onfidoSdk = Onfido.init(sdkParam);
        return false;
    });
});