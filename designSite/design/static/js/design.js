'use strict';

/* eslint-disable no-console */
/* global SDinDesign, Chart, html2canvas */

let designId = $('#canvas-box').attr('design-id');
let design;
if (designId !== '') {
    $.get(`/api/circuit?id=${designId}`, (value) => {
        design = new SDinDesign('#canvas', value);
    });
} else
    design = new SDinDesign('#canvas');

let fileReader = new FileReader();
fileReader.onload = () => {
    design.design = JSON.parse(fileReader.result);
};

$('#upload-button').on('click', function () {
    $('#fileupload').trigger('click');
}).popup({
    content: 'Import a JSON file as design.'
});
$('#fileupload').on('change', function () {
    fileReader.readAsText($('#fileupload')[0].files[0]);
});

$('#components-menu a').on('click', function (e) {
    let role = $(this).children("i").eq(0).text();
    $('input[name="component-role"]').val(role);
    $('#component-info-modal').modal({
        onHide: function () {
            $('#component-info-form div input').val("");
            $('#component-info-form div textarea').val("");
        }
    }).modal('show');
}).popup({
    // content: 'Add a component'
});

$('#add-new-component').on('click', function (e) {
    let data = {
        role: $('input[name="component-role"]').val(),
        id: $('input[name="component-id"]').val(),
        name: $('input[name="component-name"]').val(),
        version: $('input[name="component-version"]').val(),
        description: $('#component-description').val(),
        sequence: $('#component-sequence').val()
    };
    // console.log(data);
    $('#component-info-modal').modal('hide');
});

$('#save-button').on('click', () => {
    $('#safety-modal').modal('show');
}).popup({
    content: 'Save your design to server.'
});
$('#continue-save').on('click', () => {
    $('#circuit-name').val(design.name);
    $('#circuit-description').val(design.description);
    $('#save-modal').modal('show');
});
$('#save-circuit').on('click', () => {
    $('#save-modal').modal('hide');
    $('.ui.dimmer:first .loader')
        .text('Saving your circuit to server, please wait...');
    $('.ui.dimmer:first').dimmer('show');
    let postData = design.design;
    postData.circuit = {
        id: design._id,
        name: $('#circuit-name').val(),
        description: $('#circuit-description').val()
    };
    postData = {
        data: JSON.stringify(postData),
        csrfmiddlewaretoken: $('[name=csrfmiddlewaretoken]').val()
    };
    $.post('/api/circuit', postData, (v) => {
        if (v.status === 1)
            $('.ui.dimmer:first .loader')
            .text(`Success, circuit ID = ${v.circuit_id}, closing...`);
        else
            $('.ui.dimmer:first .loader')
            .text('Failed, closing...');
        setTimeout(() => {
            $('.ui.dimmer:first').dimmer('hide');
        }, 1000);
    });
});

$('#load-button').on('click', () => {
    $('.ui.dimmer:first .loader')
        .text('Querying your circuit from server, please wait...');
    $('.ui.dimmer:first').dimmer('show');
    $.get('/api/get_saves', (v) => {
        $('.ui.dimmer:first').dimmer('hide');
        $('#load-modal>.content').html('');
        v.circuits.forEach((c) => {
            let html = `
                <div class="ui segment" data-id=${c.id}>
                    <p><b>ID: </b>${c.id}</p>
                    <p><b>Name: </b>${c.name}</p>
                    <p><b>Description: </b>${c.description}</p>
                </div>`;
            $('#load-modal>.content').append(html);
        });
        $('#load-modal .segment').on('click', function () {
            let id = $(this).data('id');
            $('#load-modal').modal('hide');
            $('.ui.dimmer:first .loader')
                .text(`Loading ${id} from server, please wait...`);
            $('.ui.dimmer:first').dimmer('show');
            $.get(`/api/circuit?id=${id}`, (value) => {
                $('.ui.dimmer:first').dimmer('hide');
                design.design = value;
            });
        });
        $('#load-modal').modal('show');
    });
}).popup({
    content: 'Load your circuit from server.'
});

$('#zoom-in').on('click', () => {
    let ratio = design.ratio;
    ratio = Math.max(0.25, Math.min(1.5, ratio + 0.25));
    $('#ratio-dropdown')
        .dropdown('set value', ratio)
        .dropdown('set text', Math.round(ratio * 100) + '%');
    design.ratio = ratio;
}).popup({
    variation: 'flowing popup',
    content: 'Zoom in design. (Alt + Mousewheel up)'
});

$('#zoom-out').on('click', function () {
    let ratio = design.ratio;
    ratio = Math.max(0.25, Math.min(1.5, ratio - 0.25));
    $('#ratio-dropdown')
        .dropdown('set value', ratio)
        .dropdown('set text', Math.round(ratio * 100) + '%');
    design.ratio = ratio;
}).popup({
    variation: 'flowing popup',
    content: 'Zoom out design. (Alt + Mousewheel down)'
});

$('#ratio-dropdown')
    .dropdown({
        values: (() => {
            let values = [];
            for (let i = 25; i < 150; i += 25)
                values.push({
                    name: `${i}%`,
                    value: i / 100,
                    selected: i === 100
                });
            return values;
        })(),
        onChange: function (value, text) {
            if (text === undefined)
                return;
            if ($(this).data('initialized') === undefined) {
                $(this).data('initialized', true);
                return;
            }
            design.ratio = value;
        }
    });

$('#part-type-dropdown')
    .dropdown({
        values: SDinDesign.partTypes.map((x, i) => ({
            name: x,
            value: x,
            selected: i === 0
        }))
    });
$('#part-safety-dropdown')
    .dropdown({
        values: SDinDesign.partSafetyLevels.map((x, i) => ({
            name: `${i} - ${x}`,
            value: i,
            selected: i === 0
        }))
    });

$('.tabular.menu>.item')
    .tab({
        context: 'parent'
    });

$('.window')
    .draggable({
        appendTo: 'body',
        handle: '.nav',
        scroll: false,
        stack: '.window'
    })
    .resizable({
        handles: 's, w, sw'
    });

$('#undo-button').on('click', function () {
    design.undo();
    let t = design.canUndo;
    if (t === false)
        t = 'Unable to undo.';
    $(this).popup('get popup').html(t);
}).popup({
    variation: 'small popup',
    content: 'undo',
    onShow: function () {
        let t = design.canUndo;
        if (t === false)
            t = 'Unable to undo.';
        this.html(t);
    }
});
$('#redo-button').on('click', function () {
    design.redo();
    let t = design.canRedo;
    if (t === false)
        t = 'Unable to redo.';
    $(this).popup('get popup').html(t);
}).popup({
    variation: 'small popup',
    content: 'redo',
    onShow: function () {
        let t = design.canRedo;
        if (t === false)
            t = 'Unable to redo.';
        this.html(t);
    }
});

// Part panel
$('#part-panel')
    .resizable('option', 'minWidth', 200);
$('#part-panel-button')
    .on('click', function () {
        if (partPanelCollapsed) {
            uncollapsed();
            $(this).removeClass('left').addClass('right');
        } else {
            if (!partPanelStickedToRight)
                return;
            collapse();
            $(this).removeClass('right').addClass('left');
        }
    })
    .popup({
        content: 'Toggle part panel.'
    });
let partPanelStickedToRight = false;
let partPanelCollapsed = false;

function stickPartPanel() {
    partPanelStickedToRight = true;
    let win = $('#part-panel');
    win
        .resizable('option', 'handles', 'w')
        .draggable('option', 'snap', 'body')
        .draggable('option', 'snapMode', 'inner')
        .draggable('option', 'snapTolerance', 100)
        .draggable('option', 'axis', 'x')
        .on('drag', function (event, ui) {
            if (ui === undefined || ui.helper[0] !== win[0])
                return;
            if (ui.position.left < ui.originalPosition.left - 100) {
                if (partPanelStickedToRight)
                    unstickPartPanel();
            }
        });
    win.data('free-state', {
        height: win.height()
    });
    let toTop = $('.ui.fixed.menu').height();
    win.css({
        transition: 'all 0.2s ease'
    });
    win.css({
        left: $('body').width() - win.width(),
        top: toTop,
        height: 'calc(100% - ' + toTop + 'px)',
        borderRadius: 0,
        border: '',
        borderLeft: '1px solid grey'
    });
    setTimeout(function () {
        win.css({
            transition: ''
        });
    }, 200);
    $('#canvas-box').css({
        width: 'calc(100% - ' + win.width() + 'px)'
    });
    win
        .children('.nav')
        .children('.ui.header').hide();
    $('#part-panel-button')
        .show({
            duration: 200
        });
}

function unstickPartPanel() {
    partPanelStickedToRight = false;
    let win = $('#part-panel');
    let freeState = win.data('free-state');
    win
        .draggable('option', 'snap', 'false')
        .draggable('option', 'snapTolerance', 0)
        .draggable('option', 'axis', 'false')
        .off('drag')
        .resizable('option', 'handles', 'w, s, sw');
    win.css({
        transition: 'all 0.1s ease'
    });
    win.css({
        height: freeState.height,
        borderRadius: '5px',
        border: '1px solid grey'
    });
    $('#canvas-box').css({
        width: '100%'
    });
    setTimeout(function () {
        win.css({
            transition: ''
        });
    }, 100);
    win
        .children('.nav')
        .children('.ui.header').show();
    $('#part-panel-button')
        .hide({
            duration: 100
        });
}

function collapse() {
    partPanelCollapsed = true;
    let win = $('#part-panel');
    win
        .draggable('disable')
        .resizable('disable')
        .css({
            transition: 'left 0.2s ease',
            left: 'calc(100% - 2em)'
        })
        .children('.content')
        .hide();
    $('#part-panel-button')
        .css({
            right: '',
            left: '0.5em'
        });
}

function uncollapsed() {
    partPanelCollapsed = false;
    let win = $('#part-panel');
    win
        .draggable('enable')
        .resizable('enable')
        .css({
            left: $('body').width() - win.width()
        })
        .children('div')
        .show();
    setTimeout(function () {
        win.css({
            transition: ''
        });
    }, 200);
    $('#part-panel-button')
        .css({
            left: '',
            right: '0.5em'
        });
}
let selectedPart;
let selectedPartHelper = $('<div></div>');
$('#search-parts-dropdown').dropdown({
    apiSettings: {
        url: '/api/parts?name={query}',
        cache: false,
        beforeSend: (settings) => settings.urlData.query.length < 3 ? false : settings,
        onResponse: (response) => ({
            success: response.success === true,
            results: response.parts.map((x) => ({
                name: x.name,
                value: x.id
            }))
        })
    },
    onChange: (value) => {
        setPartPanel(value);
    }
}).popup({
    content: 'Search for a part (Case Sensitive)'
});

function setPartPanel(id) {
    if (selectedPart !== undefined && selectedPart.id === id) {
        $('#part-info-tab').transition({
            animation: 'flash',
            duration: '0.5s'
        });
        return;
    }
    $.get(`/api/part?id=${id}`, (data) => {
        if (data.success !== true) {
            console.error(`Get part info failed. ID: ${id}`);
            return;
        }
        selectedPart = data;
        $('#part-info-img')
            .attr('src', `/static/img/design/${data.type.toLowerCase()}.png`)
            .draggable('enable')
            .popup({
                content: 'Drag this part into canvas!'
            });
        $('#part-info-name')
            .add(selectedPartHelper.children('b'))
            .text(data.name);
        $('#part-type').text(data.type);
        selectedPartHelper
            .children('div')
            .children('img').attr('src', `/static/img/design/${data.type.toLowerCase()}.png`);
        $('#part-info-des>p')
            .text(data.description);
        $('#source-list').html('');
        data.works.forEach((w) => {
            $('#source-list')
                .append(`<li><a href="/work?id=${w.id}">${w.year}-${w.teamname}</li></a>`);
        });
        data.papers.forEach((p) => {
            $('#source-list')
                .append(`<li><a href="/paper?id=${p.id}">${p.title}</li></a>`);
        });
    });
}
selectedPartHelper
    .addClass('part-helper')
    .append('<b></b>')
    .prepend('<div></div>').children('div')
    .addClass('ui tiny image')
    .append('<img></img>').children('img')
    .attr('src', '/static/img/design/unknown.png');
$('#part-info-img')
    .draggable({
        revert: 'invalid',
        revertDuration: 200,
        helper: () => selectedPartHelper,
        start: () => {
            $('.SDinDesign-subpartDropper').css({
                backgroundColor: 'rgba(255, 0, 0, 0.1)'
            });
        },
        stop: () => {
            $('.SDinDesign-subpartDropper').css({
                backgroundColor: ''
            });
        }
    })
    .draggable('disable');
$('#part-panel-dropper')
    .droppable({
        accept: '#part-panel',
        tolerance: 'touch',
        over: function () {
            $('#part-panel-dropper').css({
                backgroundColor: '#9ec5e6'
            });
        },
        out: function () {
            $(this).css({
                backgroundColor: 'transparent'
            });
        },
        drop: function () {
            stickPartPanel();
            $(this).css({
                backgroundColor: 'transparent'
            });
        }
    });
$('#part-panel')
    .on('resize', function () {
        let des = $('#part-info-des');
        $('#part-panel').css({
            minHeight: 'calc(' + (des.position().top + des.parent().position().top + des.height() + 1) + 'px + 2em)'
        });
        if (partPanelStickedToRight) {
            $('#canvas-box').css({
                width: 'calc(100% - ' + $('#part-panel').width() + 'px)'
            });
        }
    });


// Favourite window
$('#fav-win')
    .resizable('option', 'minWidth', 350);
$('#fav-win-button').on('click', function () {
    $('#fav-win').fadeOut({
        duration: 200
    });
}).popup({
    content: 'Close collection window.'
});
$('#open-fav-win').on('click', () => {
    $('#fav-win').fadeToggle({
        duration: 200
    });
}).popup({
    content: 'Toggle collection window.'
});

function loadFavWin() {
    $('#fav-win>.content').html('');
    $.get('/api/get_favorite', (data) => {
        if (data.status !== 1)
            return;
        data.circuits.forEach((v) => {
            let data = `
                <div class="ui segment fav-cir-seg">
                  <div class="combine-circuit-button" data-id=${v.id}><i class="plus icon"></i></div>
                  <p><b>${v.name}</b> by <b>${v.author}</b></p>
                  <p><b>Description:</b> ${v.description}</p>
                </div>`;
            $('#fav-win>.content').append(data);
        });
        data.parts.forEach((v) => {
            let safety = SDinDesign.partSafetyLevels[v.safety];
            if (safety === undefined)
                safety = 'Unknown risk';
            let data = `
                <div class="ui segment fav-part-seg" data-id=${v.id}>
                  <div class="remove-part-fav" data-id="${v.id}"><i class="remove icon"></i></div>
                  <img src="/static/img/design/${v.type.toLowerCase()}.png"></img>
                  <p><b>BBa:</b> ${v.BBa}</p>
                  <p><b>Name:</b> ${v.name}</p>
                  <p><b>Safety level:</b> ${safety}</p>
                </div>`;
            $('#fav-win>.content').append(data);
        });
        $('.fav-part-seg').off('click').on('click', function () {
            $(this).transition({
                animation: 'pulse',
                duration: '0.2s'
            });
            setPartPanel($(this).data('id'));
        }).popup({
            content: 'Click to pick this part into part panel!'
        });
        $('.remove-part-fav').off('click').on('click', function () {
            let postData = {
                csrfmiddlewaretoken: $('[name=csrfmiddlewaretoken]').val(),
                data: JSON.stringify({
                    part_id: $(this).data('id'),
                    tag: 0
                })
            };
            $.post('/api/part_favorite', postData, (data) => {
                if (data.success !== true)
                    return;
                loadFavWin();
            });
        }).popup({
            content: 'Remove this part from your favorite'
        });
        $('.combine-circuit-button').off('click').on('click', function () {
            $.get(`/api/circuit?id=${$(this).data('id')}`, (value) => {
                design.combine(value);
            });
        }).popup({
            content: 'Add this circuit into your design!'
        });
    });
}
loadFavWin();

// Toolbox
$('#toolbox')
    .on('mouseenter', function () {
        $(this).css({
            opacity: 0.9
        });
    })
    .on('mouseleave', function () {
        $(this).css({
            opacity: 0.2
        });
    });

$('.ui.dimmer:first').dimmer({
    closable: false
});

function initPositionSize() {
    stickPartPanel();
    $('#fav-win').css({
        height: $(this).height()
    });
    $('#toolbox').css({
        bottom: 100,
        left: ($('#canvas').width() - $('#toolbox').width()) / 2,
    });
    $('#toolbox>.content').css({
        height: $('#toolbox>.content').outerHeight() + 1
    });
}
initPositionSize();

$('#add-part-button').on('click', function () {
    $('#new-part-modal')
        .modal('show');
}).popup({
    variation: 'flowing popup',
    content: 'Add your custom part into our database!'
});

$('#add-new-part')
    .on('click', function () {
        let data = {
            name: $('#part-name').val(),
            description: $('#part-description').val(),
            type: $('#part-type-dropdown').dropdown('get value'),
            subparts: []
        };
        $('#new-part-modal').modal('hide');
        $('.ui.dimmer:first .loader')
            .text('Requesting server to add the new part, please wait...');
        $('.ui.dimmer:first').dimmer('show');
        $.post('/api/part', {
            data: JSON.stringify(data),
            csrfmiddlewaretoken: $('[name=csrfmiddlewaretoken]').val()
        }, (data) => {
            if (data.success === true)
                $('.ui.dimmer:first .loader')
                .text('Success, closing...');
            else
                $('.ui.dimmer:first .loader')
                .text('Failed, closing...');
            setTimeout(() => {
                $('.ui.dimmer:first').dimmer('hide');
            }, 1000);
        });
    });

function createJsonDownload(fileName, content) {
    let aLink = $('<a></a>');
    aLink
        .attr('download', fileName)
        .attr('href', `data:application/json;base64,${btoa(JSON.stringify(content))}`);
    aLink[0].click();
}

function createPngDownload(fileName, canvas) {
    let aLink = $('<a></a>');
    aLink
        .attr('download', fileName)
        .attr('href', canvas.toDataURL('image/png'));
    aLink[0].click();
}
$('#export-button').on('click', () => {
    let filename;
    if (design.name === undefined || design.name === '')
        filename = 'unnamed_design.json';
    else
        filename = `${design.name}.json`;
    createJsonDownload(filename, design.design);
}).popup({
    content: 'Export your design as a JSON.'
});

$('#save-button')
    .on('click', function () {});

$('#image-button').on('click', function () {
    html2canvas($('#canvas'), {
        onrendered: (canvas) => createPngDownload('design.png', canvas)
    });
});

let currentMode;
const modes = {
    modifyItem: $('#drag-item'),
    dragCanvas: $('#drag-canvas'),
    deleteItem: $('#delete-item'),
    addConnection: $('#connection-dropdown-button'),
    chooseInteractive: $('#interactive-button')
};
let newConnectionType, newConnectionStep;
let newConnectionSource, newConnectionTarget;
let previewConnection = {};

function selectMode(mode) {
    if (currentMode === mode)
        return;
    let button = modes[currentMode];
    if (button !== undefined) {
        button.trigger('deselect');
        button.removeClass('active');
    }
    currentMode = mode;
    button = modes[mode];
    button.addClass('active');
    button.trigger('select');
}

$('#drag-item')
    .on('click', () => {
        selectMode('modifyItem');
    })
    .popup({
        content: 'Drag and move devices and parts.'
    });
$('#drag-canvas')
    .on('click', () => {
        selectMode('dragCanvas');
    })
    .on('select', () => {
        $(this._canvas).css({
            cursor: 'pointer'
        });
        $('.SDinDesign-part, .SDinDesign-device').css({
            pointerEvents: 'none'
        });
        design.enableDrag();
    })
    .on('deselect', () => {
        $(this._canvas).css({
            cursor: ''
        });
        $('.SDinDesign-part, .SDinDesign-device').css({
            pointerEvents: ''
        });
        design.disableDrag();
    })
    .popup({
        content: 'Drag and move canvas. (Ctrl)'
    });
$('#connection-dropdown')
    .dropdown({
        onChange: (value) => {
            newConnectionType = value;
        }
    });
$('#connection-dropdown-button')
    .on('click', () => {
        selectMode('addConnection');
    })
    .on('select', () => {
        console.log('Begin adding new connection.');
        newConnectionStep = 'chooseSource';
        design.unHighlightDevice($('.SDinDesign-device, .SDinDesign-part'));
        $('.SDinDesign-device').off('click');
        $('.SDinDesign-part')
            .off('mouseenter')
            .on('mouseenter', function () {
                if ($(this).data('connectionSelected') !== true) {
                    design.highlightDevice($(this), 0.4);
                    if (newConnectionStep === 'chooseTarget' && newConnectionType !== 'delete') {
                        previewConnection = {
                            start: newConnectionSource,
                            end: $(this).attr('part-cid'),
                            type: newConnectionType
                        };
                        design.addLink(previewConnection, true);
                        design.redrawDesign();
                    }
                }
            })
            .off('mouseleave')
            .on('mouseleave', function () {
                if ($(this).data('connectionSelected') !== true) {
                    design.unHighlightDevice($(this));
                    if (previewConnection !== undefined) {
                        design.removeLink(previewConnection);
                        previewConnection = undefined;
                    }
                }
            })
            .off('click')
            .on('click', function () {
                if ($(this).data('connectionSelected') !== true) {
                    design.highlightDevice($(this), 0.8);
                    $(this).data('connectionSelected', true);
                    if (newConnectionStep === 'chooseSource') {
                        newConnectionSource = $(this).attr('part-cid');
                        console.log(`Choose start: ${newConnectionSource}`);
                        newConnectionStep = 'chooseTarget';
                    } else if (newConnectionStep === 'chooseTarget') {
                        newConnectionTarget = $(this).attr('part-cid');
                        console.log(`Choose end: ${newConnectionTarget}`);
                        newConnectionStep = 'finished';
                        finishNewConnection();
                    }
                } else {
                    design.unHighlightDevice($(this));
                    $(this).data('connectionSelected', false);
                    if (newConnectionStep === 'chooseTarget') {
                        newConnectionStep = 'chooseSource';
                        newConnectionSource = undefined;
                    }
                }
            });
    })
    .on('deselect', () => {
        $('.SDinDesign-device, #canvas>.SDinDesign-part')
            .off('click')
            .on('click', function () {
                SDinDesign.preventClickOnDrag(design, $(this));
            });
        $('.SDinDesign-device>.SDinDesign-part')
            .off('mouseenter')
            .off('mouseleave')
            .off('click');
        design.unHighlightDevice($('.SDinDesign-part, .SDinDesign-device'));
        $('.SDinDesign-part, .SDinDesign-device').data('connectionSelected', false);
    })
    .popup({
        content: 'Add or remove a connection.'
    });

function finishNewConnection() {
    if (newConnectionType === 'delete')
        design.recordHistory(`Delete connection [${newConnectionSource}, ${newConnectionTarget}].`);
    else
        design.recordHistory(`New ${newConnectionType} connection [${newConnectionSource}, ${newConnectionTarget}].`);
    let data = {
        start: parseInt(newConnectionSource, 10),
        end: parseInt(newConnectionTarget),
        type: newConnectionType
    };
    if (newConnectionType === 'delete') {
        let removingIndex;
        $.each(design._design.lines, (index, value) => {
            if (value.start === data.start && value.end === data.end)
                removingIndex = index;
        });
        design.removeLink(design._design.lines[removingIndex]);
        design._design.lines.splice(removingIndex, 1);
    } else {
        design._design.lines.push(data);
        design.addLink(data, false);
    }
    if (previewConnection !== undefined) {
        design.removeLink(previewConnection);
        previewConnection = undefined;
    }
    design.redrawDesign();
    selectMode('modifyItem');
}
let currentPopupId;
$('#interactive-button')
    .on('click', () => {
        selectMode('chooseInteractive');
    })
    .on('select', () => {
        design.unHighlightDevice($('.SDinDesign-device, .SDinDesign-part'));
        $('.SDinDesign-device').off('click');
        $('.SDinDesign-part')
            .off('mouseenter')
            .on('mouseenter', function () {
                design.highlightDevice($(this), 0.4);
            })
            .off('mouseleave')
            .on('mouseleave', function () {
                design.unHighlightDevice($(this));
            })
            .off('click')
            .on('click', function () {
                let id = $(this).attr('part-id');
                if (currentPopupId === id)
                    return;
                currentPopupId = id;
                $('.SDinDesign-part').popup('destroy');
                $('.ui.dimmer:first .loader')
                    .text('Loading interact data...');
                $('.ui.dimmer:first').dimmer('show');
                $.get(`/api/interact?id=${id}`, (value) => {
                    let table = $('<div></div>')
                        .append('<h5 class="ui header">Predicted interaction</h5>')
                        .append('<table></table>')
                        .css({
                            maxHeight: 600,
                            overflowY: 'auto'
                        });
                    table.children('table')
                        .addClass('ui basic compact striped table')
                        .append('<tr><th>BBa</th><th>Name</th><th>Score</th><th>Type</th></tr>');

                    // convert parts to table
                    let rows = [];
                    $.each(value.parts, (i, v) => {
                        if (i > 10)
                            return;
                        if (v.score < 0)
                            return;
                        let row = $(`<tr><td>${v.BBa}</td><td>${v.name}</td><td>${v.score}</td><td>${v.type}</td></tr>`);
                        row.attr('part-id', v.id);
                        row.appendTo(table.children('table'));
                        rows.push(row);
                    });

                    $('.ui.dimmer:first').dimmer('hide');
                    $(this).popup({
                        variation: 'flowing',
                        on: 'click',
                        html: table.html()
                    });
                    $(this).popup('show');

                    $('.popup tr').each((i, row) => {
                        if (i == 0)
                            return;
                        $(row).on('mouseenter', function () {
                            setPartPanel($(this).attr('part-id'));
                        }).css({
                            cursor: 'pointer'
                        });
                    });
                });
            });
    })
    .on('deselect', () => {
        $(`[part-id=${currentPopupId}]`).popup('destroy');
        $('.SDinDesign-device, #canvas>.SDinDesign-part')
            .off('click')
            .on('click', function () {
                SDinDesign.preventClickOnDrag(design, $(this));
            });
        $('.SDinDesign-device>.SDinDesign-part')
            .off('mouseenter')
            .off('mouseleave')
            .off('click');
        design.unHighlightDevice($('.SDinDesign-part, .SDinDesign-device'));
    })
    .popup({
        variation: 'flowing popup',
        content: 'Check predicted interactions of parts.'
    });

let tmp;

$('#delete-item')
    .on('click', () => {
        selectMode('deleteItem');
    })
    .on('select', () => {
        design.unHighlightDevice($('.SDinDesign-device, .SDinDesign-part'));
        $('.SDinDesign-device').off('click');
        $('.SDinDesign-part')
            .off('mouseenter')
            .on('mouseenter', function () {
                design.highlightDevice($(this), 0.4);
            })
            .off('mouseleave')
            .on('mouseleave', function () {
                design.unHighlightDevice($(this));
            })
            .off('click')
            .on('click', function () {
                let data = design.getData(this);
                console.log(data);
                if (data.part !== undefined)
                    design.deletePart(data.device, data.part);
            });
    })
    .on('deselect', () => {
        $('.SDinDesign-device, #canvas>.SDinDesign-part')
            .off('click')
            .on('click', function () {
                SDinDesign.preventClickOnDrag(design, $(this));
            });
        $('.SDinDesign-device>.SDinDesign-part')
            .off('mouseenter')
            .off('mouseleave')
            .off('click');
        design.unHighlightDevice($('.SDinDesign-part, .SDinDesign-device'));
    })
    .popup({
        variation: 'flowing popup',
        content: 'Delete a part.'
    });

$('#clear-all-button')
    .on('click', () => {
        $('#clear-all-modal').modal('show');
    })
    .popup({
        content: 'CLEAR THE CANVAS!'
    });
$('#real-clear-all-button')
    .on('click', () => {
        design.clearAll();
    });

$('#simulation-button')
    .on('click', () => {
        let data = design.matrix;
        let postData = {
            data: JSON.stringify(data.matrix),
            csrfmiddlewaretoken: $('[name=csrfmiddlewaretoken]').val()
        };
        $('.ui.dimmer:first .loader')
            .text('Running on server, please wait...');
        $('.ui.dimmer:first').dimmer('show');
        $.post('/api/simulation', postData, (v) => {
            $('.ui.dimmer:first').dimmer('hide');
            $('#simulation-modal').modal('show');
            let labels = v.time;
            let datasets = [];
            for (let i = 0; i < v.result[0].length; ++i)
                datasets.push({
                    label: data.partName[i],
                    data: [],
                    fill: false,
                    pointRadius: 0,
                    borderColor: `hsl(${i * 360 / v.result[0].length}, 100%, 80%)`,
                    backgroundColor: 'rgba(0, 0, 0, 0)'
                });
            v.result.forEach((d) => {
                d.forEach((x, i) => {
                    datasets[i].data.push(x * 38);
                });
            });
            new Chart($('#simulation-result'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    scales: {
                        xAxes: [{
                            ticks: {
                                beginAtZero: true,
                                callback: (v) => v.toFixed(1)
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'time (h)'
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'concentration (μM)'
                            }
                        }]
                    }
                }
            });
        });
    })
    .popup({
        content: 'Run simulation on the design.'
    });

let safetyPopupContent;
$('#safety').popup({
    position: 'bottom right',
    variation: 'wide popup',
    content: 'safety',
    onShow: function () {
        console.log(safetyPopupContent);
        this.html(safetyPopupContent);
    }
});

function updateSafety(safety) {
    if (safety <= 1) {
        $('#safety').removeClass('red yellow').addClass('green')
            .html('Low risk<img src="/static/img/design/safety-1.png"></img>');
    } else if (safety === 2) {
        $('#safety').removeClass('red green').addClass('yellow')
            .html('Moderate risk<img src="/static/img/design/safety-2.png"></img>');
    } else if (safety === 3) {
        $('#safety').removeClass('yellow green').addClass('red')
            .html('High risk<img src="/static/img/design/safety-3.png"></img>');
    }

    if (safety === 3) {
        safetyPopupContent = `
            <div class="header">Warning!</div>
            <div class="content">Please check your design again in case of
                using any potential risky part! We don't recommend you to
                use parts with high risk ground. Change them into safe parts?</div>`;
        $('#safety').popup('show');
    } else {
        $('#safety').popup('hide');
        safetyPopupContent = `
            <div class="header">Safe!</div>
            <div class="content">Your design is now under an acceptable safety level.</div>`;
    }
}

$('#show-plasmid').on('click', function () {
    $('#plasmid-modal').modal('show');
});

$(window)
    .on('keydown', (event) => {
        if (event.ctrlKey === true) selectMode('dragCanvas');
    })
    .on('keyup', () => {
        selectMode('modifyItem');
    });

selectMode('modifyItem');
updateSafety();