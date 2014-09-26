UI.registerHelper('selectedIfEq', function (key, value) {
    if (value === undefined) {
        value = '';
    }
    return key == value ? {
        selected: 'selected'
    } : '';
});

UI.registerHelper('log', function (arg, caption) {
    if (caption == undefined) caption = ''
    console.log("log:" + caption, arg);
});



UI.registerHelper('fetching', function () {
    return Session.get('fetching');
});


UI.registerHelper('test', function () {
    return "this is a test helper";
});



// once off for your entire project
Template.xedit.rendered = function () {
    var container = this.$('*').eq(0);    
    this.autorun(function () {
        console.log('autorun');
        var value = Blaze.getCurrentData().value;
        
        var elData = container.data();
        console.log(value,'xx', elData);
        if (elData && elData.editable) {
            elData.editable.setValue(value, true);
            // no idea why this is necessary; xeditable bug?
            if (elData.editableContainer)
                elData.editableContainer.formOptions.value = elData.editable.value;
        }
    });
}