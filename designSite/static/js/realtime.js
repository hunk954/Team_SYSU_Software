/* global design */
/* eslint-disable no-console */
/* exported my_syn */
let isRealtimeReading = true;
$('#canvas').css('background', 'rgba(255, 255, 255, 0.3)');
$('#realtime-button')
    .on('click', function() {
        isRealtimeReading = !isRealtimeReading;
        if (isRealtimeReading) {
            $('#canvas').css('background', 'rgba(255, 255, 255, 0.3)');
        } else {
            $('#canvas').css('background', 'rgba(255, 255, 255, 0)');
        }
    })
    .popup({
        content: 'click me to toggle following or not.'
    });
// $('#realtime-save')
//     .on('click', function() {
//         $.post({
//             url: `/api/realtime/${design.design.id}`,
//             data: {
//                 'design_data': JSON.stringify(design.design),
//                 'first_time': JSON.stringify(false),
//                 csrfmiddlewaretoken: $('[name=csrfmiddlewaretoken]').val()
//             },
//             success: () => {
//                 console.log('success');
//             }
//         });
//     })
//     .popup({
//         content: 'click me to send your changes to others.'
//     });

setInterval(() => {
    if (isRealtimeReading) {
        $.get({
            'url': `/api/realtime/${design.design.id}`,
            success: (data) => {
                let design_data = JSON.parse(data['design_data']);
                design.design = design_data;
            }
        });
    } else {
        $.post({
            url: `/api/realtime/${design.design.id}`,
            data: {
                'design_data': JSON.stringify(design.design),
                'first_time': JSON.stringify(false),
                csrfmiddlewaretoken: $('[name=csrfmiddlewaretoken]').val()
            },
        });
    }
}, 500);

// function my_syn() {
//     $.post({
//         url: `/api/realtime/${design.design.id}`,
//         data: {
//             'design_data': JSON.stringify(design.design),
//             'first_time': JSON.stringify(false),
//             csrfmiddlewaretoken: $('[name=csrfmiddlewaretoken]').val()
//         },
//     });
// }
$('#realtime-exit')
    .on('click', function() {
        let pn = window.location.pathname.split('/');
        pn.splice(pn.length-2, 1); // remove second to last
        window.location.pathname = pn.join('/');
    })
    .popup({
        content: 'exit real time share.'
    });