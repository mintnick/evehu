
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
        pageLength: 15,
        language: {
            info: "雇佣记录上限500条",
            paginate: {
                "next": "下一页",
                "previous": "上一页",
                "first": "第一页",
                "last": "最后一页",
            }
        },
        order: [],
    });
});
