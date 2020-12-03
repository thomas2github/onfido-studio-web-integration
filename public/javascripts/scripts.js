$(document).ready(function() {

    window_width = $(window).width();

    $('[data-toggle="toggle"]').click(function(){
        $(this).parents().next('.hide').toggle();
    });

    $('#switchAll').click(function(e){
        var table= $(e.target).closest('table');
        $('td input:checkbox',table).prop('checked', $(e.target).prop("checked"));
    });

});