$(document).ready(function() {

    // Update select option depending on the selected country
    $('#issuingCountry').change(function(){
        $('#type').children('option:not(:last)').remove();
        for (const supportedDocument of JSON.parse($(this).children("option:selected").attr('data-supportedDocuments'))) {
            $('#type').prepend(
                $('<option></option>').val(supportedDocument.docTypeCode).html(supportedDocument.docTypeName)
            );
        }
    });
    $('#issuingCountry').val('FRA').change()

});