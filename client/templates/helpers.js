UI.registerHelper('selectedIfEq', function (key, value) {
    if (value === undefined) {
        value = '';
    }
    return key == value ? {
        selected: 'selected'
    } : '';
});

UI.registerHelper('log', function (arg, caption) {
    if (caption == undefined || (typeof caption == 'object')) caption = '';
    console.log('Template log', caption, arg);
});



UI.registerHelper('fetching', function () {
    return Session.get('fetching');
});


UI.registerHelper('test', function () {
    return "this is a test helper";
});