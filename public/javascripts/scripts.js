$(function() {
    $('[data-toggle="toggle"]').on('click', function(){
        $(this).parents().next('.hide').toggle();
    });

    $('.amount-selector').on('click', function() {
        // remove active and checked
        $('.amount-selector').removeClass('active');
        $('.amount-selector').parent().find('input').removeAttr('checked');
        $('.amount-selector').parent().find('p').removeClass('text-blue');
        $('.amount-selector').parent().find('h4').removeClass('text-blue');
        // add active and checked to current
        $(this).addClass('active');
        $(this).parent().find('input').attr('checked');
        $(this).parent().find('p').addClass('text-blue');
        $(this).parent().find('h4').addClass('text-blue');
        //set amount value
        $('#amount').val(parseInt($(this).attr('id').substring(6)));
    });
});