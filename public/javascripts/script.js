$(document).ready(function() {
    $('#autocomplete').autocomplete({
        autoSelectFirst: true,
        serviceUrl: '/autocomplete/',
        dataType: 'json',
        groupBy: 'groupBy',
        onSelect: function (suggestion) {
            window.location = '/' + suggestion.data.type + '/' + suggestion.data.id;
        },
        error: function(e) {console.log(e)}
    });
})