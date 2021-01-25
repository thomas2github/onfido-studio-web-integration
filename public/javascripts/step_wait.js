$(document).ready(function() {
    let countdown = 15;
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    const viewresult = (vars['viewresult'])?(vars['viewresult'] == 'true'):false;

    if(!viewresult) {
        setInterval(() => {
            if(countdown > 0) {
                countdown--;
                $('#countdown').html(countdown.toString()+'s');
            } else {
                window.location.replace('/usecases/wait?viewresult=true');
            }
        }, 1000);
    }
    
});