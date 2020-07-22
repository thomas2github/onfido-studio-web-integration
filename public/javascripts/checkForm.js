$(document).ready(function() {

    // enable / disabled radio -> facial similarity
    $('#reportFacialSimilarity').change(function(){
        $('#reportFacialSimilarityPhoto, #reportFacialSimilarityPhotoFullyAuto, #reportFacialSimilarityVideo').prop( "disabled", !($(this).is(':checked'))),
        $('#reportFacialSimilarityPhoto, #reportFacialSimilarityPhotoFullyAuto, #reportFacialSimilarityVideo').parent().toggleClass('disabled', !($(this).is(':checked')))
    });

    // enable / disabled radio -> watchlist
    $('#reportWatchlist').change(function(){
        $('#reportWatchlistEnhanced, #reportWatchlistStandard, #reportWatchlistPepsOnly, #reportWatchlistSanctionsOnly').prop( "disabled", !($(this).is(':checked'))),
        $('#reportWatchlistEnhanced, #reportWatchlistStandard, #reportWatchlistPepsOnly, #reportWatchlistSanctionsOnly').parent().toggleClass('disabled', !($(this).is(':checked')))
    });

    // add tags input component
    const node = document.querySelector('#tagsInput');
    const tagInput = taginput(node);
    // Added tag event
    $('#tagsInput').change(function(){
        $('#tags').val(tagInput.tags);
    });

    // enable / disabled applicant provides data related parameters
    $('#applicantProvidesData').change(function(){
        $('#asynchronous, #suppressFormEmail, #redirectUri, #consider').prop( "disabled", !($(this).is(':checked'))),
        $('#asynchronous, #suppressFormEmail').parent().toggleClass('disabled', !($(this).is(':checked')))
    });
});