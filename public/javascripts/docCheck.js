$(document).ready(function() {
    // back side depending on document type
    $('#type').change(function(){
        if($(this).val() == 'passport'){
            $('#backInput').hide();
        } else {
            $('#backInput').show();
        }
    });
});