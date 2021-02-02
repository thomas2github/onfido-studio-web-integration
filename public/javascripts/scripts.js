$(document).ready(function() {

    window_width = $(window).width();

    $('[data-toggle="toggle"]').click(function(){
        $(this).parents().next('.hide').toggle();
    });

    $('#switchAll').click(function(e){
        const table= $(e.target).closest('table');
        $('td input:checkbox',table).prop('checked', $(e.target).prop("checked"));
    });

    $('#webhook_button').click(function() {
        if($('#webhook_url').val() != ''){
            $('#webhook_iframe').attr('src', $('#webhook_url').val());
            $('#webhook_iframe').removeClass('d-none');
        } else {
            $('#webhook_iframe').removeAttr('src');
            $('#webhook_iframe').addClass('d-none');
        }
    });

});