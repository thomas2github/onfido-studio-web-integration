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
        $('#webCamera').hide();
        $('#onfidoWebSdk').hide();
        return false;
    });

    // Display web camera 
    $('.js-showWebCamera').click(function(){
        $('#webCamera').show();
        $('#webUpload').hide();
        $('#onfidoWebSdk').hide();
        return false;
    });

    // Init & display Onfido web SDK
    var onfidoOut = null;    
    $('.js-showOnfidoWebSdk').click(function(){
        if (onfidoOut!=null) {
            onfidoOut.tearDown();
        }
        $('#onfidoWebSdk').show();
        $('#webUpload').hide();
        $('#webCamera').hide();
        onfidoOut = Onfido.init({
            token: $(this).attr('token'),
            containerId: 'onfido-mount',
            onComplete: function(data) {
                window.location = '/resources/applicants/' + $(this).attr('applicant-id');
            },
            steps: [
                'document'
            ]
        });
        return false;
    });
});