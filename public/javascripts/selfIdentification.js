$(document).ready(function() {
    // back side depending on document type
    $('[data-toggle="toggle"]').click(function(){
        $(this).parents().next('.hide').toggle();
    });

    //add event listener and update message table with sdk events
    // function getAllEvents(element) {
    //     var result = [];
    //     for (var key in element) {
    //         if (key.indexOf('on') === 0) {
    //             result.push(key.slice(2));
    //         }
    //     }
    //     return result.join(' ');
    // }
    // var el = $('#onfido-mount');
    // el.bind(getAllEvents(el[0]), function(e) {
    //     console.log('hello');
    //     console.log(e);
    // });

    //set Onfido SDK
    $('.onfido-sdk-ui-Modal-inner').remove();
    const useModal = false;
    const welcomeStep = true;
    const forceCrossDevice = true;
    const useLiveDocumentCapture = false;
    const documentStep = true;
    const selfieStep = true;
    const videoStep = false;
    const completeStep = true;
    let steps = [];
    if (documentStep) {
        steps.push(
            {
                type: 'document',
                options: {
                    forceCrossDevice: forceCrossDevice,
                    useLiveDocumentCapture: useLiveDocumentCapture,
                    uploadFallback: true
                }
            }
        );
    }
    if (selfieStep) {
        steps.push(
            {
                type: 'face',
                options: {
                    forceCrossDevice: forceCrossDevice,
                    requestedVariant: 'standard',
                    useMultipleSelfieCapture: true,
                    uploadFallback: true
                }
            }
        );
    }
    if (videoStep) {
        steps.push(
            {
                type: 'face',
                options: {
                    forceCrossDevice: forceCrossDevice,
                    requestedVariant: 'video',
                    useMultipleSelfieCapture: true,
                    uploadFallback: true
                }
            }
        );
    }
    if (completeStep) {
        steps.push(
            {
                type: 'complete',
                options: {
                }
            }
        );
    }
    let onfidoSdk;
    let sdkParam = {
        token: $('#onfido-mount').attr('data-token'),
        containerId: 'onfido-mount',
        useModal: useModal,
        isModalOpen: true,
        onModalRequestClose: function() {
            // Update options with the state of the modal
            onfidoSdk.setOptions({isModalOpen: false})
        },
        onComplete: function(data) {
            window.location = '/self-identification/check';
        },
        steps: steps
    };
    welcomeParam = {
        type: 'welcome',
        options: {
            title: 'Welcome at Onfido!',
            descriptions: ['Take a picture of you ID document and a selfie.','We will automatically fill the subscription form.'],
            nextButton: 'Start ID verification'
        }
    };
    if (welcomeStep) {
        sdkParam.steps.unshift(welcomeParam);
    }
    
    onfidoSdk = Onfido.init(sdkParam);

    $('#onfido-mount').on('userAnalyticsEvent', function(event){console.log(event)})


});