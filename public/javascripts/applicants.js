$(document).ready(function() {
    
    //set document table
    // const applicantsTable = $('#applicantsTable').DataTable( {
    //     // 'dom': 'Blfrtip',
    //     'dom': '<"flex-row align-items-center"<"text-primary float-left"f><"text-primary float-right"p>>t',
    //     'paging': true,
    //     'pageLength': 20,
    //     'ordering': true,
    //     // 'searchCols': [null, null, null, null, null],
    //     'info': false,
    //     // 'order': [[ 4, 'desc' ], [ 1, 'asc' ], [ 1, 'asc' ]],
    //     'select': true,
    //     // 'buttons': [ 'selectAll', 'selectNone'],
    //     // 'language': {
    //     //     'buttons': {
    //     //         'selectAll': "Select all items",
    //     //         'selectNone': "Select none"
    //     //     }
    //     // }
    //     initComplete: function () {
    //         this.api().columns().every( function () {
    //             var column = this;
    //             var select = $('<select><option value=""></option></select>')
    //                 .appendTo( $(column.header()) )
    //                 .on( 'change', function () {
    //                     var val = $.fn.dataTable.util.escapeRegex(
    //                         $(this).val()
    //                     );
 
    //                     column
    //                         .search( val ? '^'+val+'$' : '', true, false )
    //                         .draw();
    //                 } );
 
    //             column.data().unique().sort().each( function ( d, j ) {
    //                 select.append( '<option value="'+d+'">'+d+'</option>' )
    //             } );
    //         } );
    //     }
    // });

});