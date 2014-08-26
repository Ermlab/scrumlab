Template.panelTmpl.rendered = function () {
    console.log('panel rendered', this);

    $('.panel-body').each(function () {
        $(this).scrollspy('refresh');
    })
};