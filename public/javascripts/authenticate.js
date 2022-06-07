$(document).ready(function() {
    // $('.onfido-sdk-ui-Modal-inner').remove();
    let steps = [];
    steps.push(
        {
            type: 'auth',
            options: {
                retries: 3
            }
        }
    );
    
    let onfidoSdk;
    const token = $('#sdkToken').val();
    const applicantId = $('#applicantId').val();

    let sdkParam = {
        useModal: false,
        language: 'en_US',
        steps: steps,
        token: token,
        containerId: 'onfido-mount',
        onComplete: function(data) {
            alert(JSON.stringify(data));
            window.location = '/applicants/'+applicantId;
        },
        onError: function(data) {
            // alert(JSON.stringify(data));
            window.location = '/applicants/'+applicantId;
        },
    };
        
    console.log('sdkconfig: ', sdkParam);
    onfidoSdk = OnfidoAuth.init(sdkParam);
    return false;
});