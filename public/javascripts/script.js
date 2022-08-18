
$(document).ready(function() {
    // Auto-complete
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

    // DataTables
    $('table.datatables').DataTable({
        searching: false,
        bLengthChange: false,
        info: false,
        language: {
            info: "第 _PAGE_ 页(共 _PAGES_ 页)",
            paginate: {
                "next": "下一页",
                "previous": "上一页",
                "first": "第一页",
                "last": "最后一页",
            }
        },
    });
});
