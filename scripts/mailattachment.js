var ma1 = {};
ma1.debugg = true; // if need prod  => change to false 
ma1.routes = {};
ma1.routes.rootMac = ma1.debugg ? "http://136.144.187.71:91/api/mac/" : '';
// get data
ma1.routes.getAdministrations = ma1.routes.rootMac + "MACGetAdministrations";
ma1.routes.getCreditors = ma1.routes.rootMac + "MACGetCreditors/{administration}";
ma1.routes.getCreditorData = ma1.routes.rootMac + "MACGetCreditorData/{creditor}/{administration}";
// set data
ma1.routes.setCreditorData = ma1.routes.rootMac + "MACSaveCreditorData";

ma1.elements = {
    buttons: {
        save: { id: "btn_save", object: {} },
    },
    inputs: {
        maindocument: { id: "ipt_main_document", object: {} },
        mainattachment: { id: "ipt_main_attachment", object: {} }
    },
    checkboxes: {
        addattachment: { id: "cbx_add_attachment", object: {} }
    },
    dropdowns: {
        administrator: { id: "slt_choose_administrator", object: {} },
        creditor: { id: "slt_choose_creditor", object: {} },
        maindocument: { id: "slt_main_document", object: {} },
        attachment: { id: "slt_main_attachment", object: {} },
    },
    datatables: {
        userfields: {
            state: true,
            id: "dt_user_defined_fields",
            object: {},
            columns: [{ title: "Name" }, { title: "Value" }],
            dt: {},
            data: { origin: {}, aaData: [], ID: '', name: '', administrationID: '' },
            clean: function() {},
            init: function() {},
            addRow: function() {},
            deleteRow: function() {},
        }
    }
};

ma1.handlers = {
    routeUpdate: function(route, values) {
        $.each(values, function(i, v) {
            route = route.replace("{" + v.key + "}", v.value);
        });
        route = route.indexOf('{') > -1 ? route.replace(/\{.+\}/g, '') : route;
        return route;
    },
    getobject: function(id) {
        return $("#" + id);
    },
    input: {
        getText: function(input) {
            return input.val();
        },
        setText: function(input, text) {
            input.val(text);
        }
    },
    checkbox: {
        getValue: function(checkbox) {
            return checkbox.prop('checked');
        },
        setValue: function(checkbox, value) {
            checkbox.prop('checked', value);
        },
    },
    dropdown: {
        addOptions: function(dropdown, data) {
            dropdown.empty();
            $.each(data, function(value, text) {
                var option = document.createElement("option");
                option.text = text;
                option.value = value;
                dropdown.append(option);
            });
            dropdown.selectpicker("refresh");
        },
        getSelectedText: function(dropdown) {
            return dropdown.find("option:selected").text();
        },
        getSelectedValue: function(dropdown) {
            return dropdown.find("option:selected").val();
        },
        setSelectedValue: function(dropdown, value) {
            dropdown.val(value);
            dropdown.selectpicker("refresh");
        }
    },
    datatables: {
        clean: function(table) {
            if (!$.isEmptyObject(table.dt)) {
                if (table.object[0].innerHTML != '') table.dt.destroy();
                table.object[0].innerHTML = '';
            }
        },
        init: function(table, aaData) {
            ma1.handlers.datatables.clean(table);
            table.dt = table.object.DataTable({
                "select": true,
                "responsive": true,
                "data": aaData,
                "columnDefs": [{
                        'targets': 1,
                        'searchable': false,
                        'orderable': false,
                        'render': function(data, type, full, meta) {
                            if (data.indexOf('style="width:100%"') != -1) return data;
                            var arr = [],
                                str = "";
                            var res = data.split(';');
                            res.forEach(function(val, i) {
                                val.trim().split(' ').forEach(function(val) {
                                    arr.push(val);
                                });
                            });
                            arr.forEach(function(val, i) {
                                str += val + '<br>';
                            });
                            return str;
                        }
                    },
                    {
                        'targets': 2,
                        'searchable': false,
                        'orderable': false,
                        'className': 'dt-body-center',
                        'render': function(data, type, full, meta) {
                            return '<div class="row"><div class="col-md-8 col-md-offset-4"><div class="btn-group group-1"><a id="" class="btn btn-primary edit-row btn-sm"><span class="pe-7s-pen pe-1_5x " aria-hidden="true"></span></a><a id="" class="btn btn-danger delete-row btn-sm" style="margin-left:5px"><span class="pe-7s-trash pe-1_5x " aria-hidden="true"></span></a></div>     <div class="btn-group group-2" style="display:none"><a id="" class="btn btn-primary ok-row btn-sm"><span class="pe-7s-check pe-1_5x" aria-hidden="true"></span></a><a id="" class="btn btn-danger cancel-row btn-sm" style="margin-left:5px"><span class="pe-7s-close-circle pe-1_5x " aria-hidden="true"></span></a></div></div></div>';
                        }
                    }
                ],
                "columns": table.columns,
                "dom": "<'row'<'col-md-4'><'col-md-8'B>>t<'clear'p>",
                "buttons": [{
                    text: "<span class='pe-7s-plus pe-va font-bold pe-1_2x'></span>&nbsp;Add new field",
                    className: "btn btn-primary btn-sm dt-btn dt-btn-m-b-10",
                    action: function(e, dt, node, config) {
                        ma1.handlers.datatables.addRow(table);
                    }
                }]
            });
            ma1.handlers.datatables.setEvents(table);
        },
        setEvents: function(table) {
            table.object.find('.edit-row').off().click(function() {
                ma1.handlers.datatables.editRow(table, $(this));
            });

            table.object.find('.delete-row').off().click(function() {
                ma1.handlers.datatables.deleteRow(table, $(this));
            });

            table.object.find('.ok-row').off().click(function() {
                console.log('ok');
                ma1.handlers.datatables.okRow(table, $(this));
            });

            table.object.find('.cancel-row').off().click(function() {
                console.log('cancel');
                ma1.handlers.datatables.cancelRow(table, $(this));
            });

        },
        deleteRow: function(table, that) {
            if (!ma1.elements.datatables.userfields.state) {
                ma1.helpfunc.editSpop();
                return;
            }
            var row = table.dt.row(that.parents('tr'));
            var datarow = row.data();
            ma1.elements.datatables.userfields.data.aaData = ma1.elements.datatables.userfields.data.aaData.filter(function(val) {
                return datarow[0] == val[0] ? false : true;
            });
            row.remove().draw(false);
        },

        editRow: function(table, that) {
            if (!ma1.elements.datatables.userfields.state) {
                ma1.helpfunc.editSpop();
                return;
            }
            ma1.elements.datatables.userfields.state = false;
            var res = ma1.helpfunc.findTrTdData(that);
            if (!ma1.helpfunc.existInput(res[1])) {
                ma1.helpfunc.createInputField(res[1], res[2]);
                ma1.css.onDisplay($(res[0]).find('.group-2'));
                ma1.css.ofDisplay($(res[0]).find('.group-1'));
            }
        },
        cancelRow: function(table, that) {
            var el0, el1, el0data, el1data;
            var res = ma1.helpfunc.findTrTdData(that);
            el0 = res[1][0];
            el1 = res[1][1];
            el0data = ma1.helpfunc.findDataPrev($(el0).find('input'));
            el1data = ma1.helpfunc.findDataPrev($(el1).find('input'));
            ma1.helpfunc.deleteInput(el0);
            ma1.helpfunc.deleteInput(el1);
            if (el0data == "0") {
                var row = table.dt.row(that.parents('tr'));
                var datarow = row.data();
                ma1.helpfunc.deleteDataClick(datarow);
                row.remove().draw(false);

            } else {
                ma1.helpfunc.setTdtext(el0, el0data);
                ma1.helpfunc.setTdHTML(el1, el1data);
                ma1.css.onDisplay($(res[0]).find('.group-1'));
                ma1.css.ofDisplay($(res[0]).find('.group-2'));
            }
            ma1.elements.datatables.userfields.state = true;
        },
        okRow: function(table, that) {
            var el0, el1, el0data, el1data;
            var res = ma1.helpfunc.findTrTdData(that);
            el0 = res[1][0];
            el1 = res[1][1];
            el0data = ma1.helpfunc.getInputValue($(el0).find('input'));
            el1data = ma1.helpfunc.getInputValue($(el1).find('input'));
            ma1.helpfunc.deleteInput(el0);
            ma1.helpfunc.deleteInput(el1);
            if (ma1.helpfunc.filterData([el0data, el1data])) {
                ma1.elements.datatables.userfields.data.aaData.push([el0data, el1data]);
                ma1.handlers.datatables.init(table, ma1.elements.datatables.userfields.data.aaData);
                ma1.elements.datatables.userfields.state = true;
            } else {
                ma1.elements.datatables.userfields.data.aaData.push([el0data, el1data]);
                ma1.helpfunc.setTdtext(el0, el0data);
                ma1.helpfunc.setTdHTML(el1, el1data);
                ma1.css.onDisplay($(res[0]).find('.group-1'));
                ma1.css.ofDisplay($(res[0]).find('.group-2'));
                ma1.elements.datatables.userfields.state = true;
            }
        },
        addRow: function(table) {
            if (!ma1.elements.datatables.userfields.state) {
                ma1.helpfunc.editSpop();
                return;
            }
            table.dt.row.add([
                '<div class="input-group" style="width:100%"><input type="text" class="form-control"  data-prev="0" value="0" aria-label="..."></div>',
                '<div class="input-group" style="width:100%"><input type="text" class="form-control"  data-prev="0" value="0" aria-label="..."></div>',
            ]).draw();
            ma1.handlers.datatables.setEvents(table);
            ma1.elements.datatables.userfields.state = false;
            var inp = $(table.object.find('input').parents('tr'));
            var group1 = inp.find('.group-1');
            var group2 = inp.find('.group-2');
            ma1.css.onDisplay(group2);
            ma1.css.ofDisplay(group1);
        },
    }
};

ma1.css = {
    onDisplay: function(el) {
        $(el).css({ display: 'block' });
    },
    ofDisplay: function(el) {
        $(el).css({ display: 'none' });
    }
};

ma1.helpfunc = {
    createInputField: function(el, data) {
        var $el0 = $(el[0]);
        var $el1 = $(el[1]);
        var html = function(data) { return '<div class="input-group" style="width:100%"><input type="text" class="form-control"  data-prev="' + data + '" value="' + data + '" aria-label="..."></div>'; };
        $el0.empty();
        $el1.empty();
        $el0.append(html(data[0]));
        $el1.append(html(data[1]));
    },
    getTdtext: function(el) {
        return $(el).text();
    },
    setTdtext: function(el, value) {
        $(el).text(value);
    },
    setTdHTML: function(el, html) {
        var arr = [],
            str = "";
        var res = html.split(';');
        res.forEach(function(val, i) {
            val.trim().split(' ').forEach(function(val) {
                arr.push(val);
            });
        });
        arr.forEach(function(val, i) {
            str += val + '<br>';
        });
        $(el).html(str);
    },
    getInputValue: function(input) {
        return $(input).val();
    },
    findTrTdData: function(elThat) {
        var $that = $(elThat);
        var row = ma1.elements.datatables.userfields.dt.row($that.parents('tr'));
        var datarow = row.data();
        var tr = $that.closest('tr');
        var td = [$(tr[0]).find('td')[0], $(tr[0]).find('td')[1]];
        return [tr, td, datarow];
    },
    existInput: function(el) {
        return $(el).find('input').length > 0 ? true : false;
    },
    deleteInput: function(dt) {
        $(dt).empty();
    },
    findDataPrev: function(el) {
        return $(el).attr('data-prev');
    },
    deleteDataClick: function(data) {
        ma1.elements.datatables.userfields.data.aaData = ma1.elements.datatables.userfields.data.aaData.filter(function(val, i) {
            return val[0] != data[0];
        });
    },
    createResAddata: function(arr) {
        var res = [];
        arr.forEach(function(val) {
            res.push({ name: val[0], value: val[1] });
        });
        return res;
    },
    filterData: function(dataArr) {
        var state = false;
        ma1.elements.datatables.userfields.data.aaData = ma1.elements.datatables.userfields.data.aaData.filter(function(val) {
            if (dataArr[0] != val[0]) {
                return true;
            } else {
                state = true;
                return false;
            }
        });

        return state;
    },
    editSpop: function() {
        spop({
            template: '<h4 class="spop-title">Please end edit field</h4>',
            position: 'top-right',
            style: 'default',
            autoclose: 4000
        });
    },
    serverError: function(text) {
        spop({
            template: '<h4 class="spop-title">Server Error:' + text + '</h4>',
            position: 'top-right',
            style: 'error',
            autoclose: 4000
        });
    },
    userInfo: function(text) {
        spop({
            template: '<h4 class="spop-title">' + text + '</h4>',
            position: 'top-right',
            style: 'warning',
            autoclose: 4000
        });
    }
};

ma1.init = {
    elements: function() {
        // buttons
        ma1.elements.buttons.save.object = ma1.handlers.getobject(ma1.elements.buttons.save.id);
        // buttons event handlers
        ma1.elements.buttons.save.object.click(function() { ma1.actions.save(); });
        // inputs
        ma1.elements.inputs.maindocument.object = ma1.handlers.getobject(ma1.elements.inputs.maindocument.id);
        ma1.elements.inputs.mainattachment.object = ma1.handlers.getobject(ma1.elements.inputs.mainattachment.id);
        // checkboxes
        ma1.elements.checkboxes.addattachment.object = ma1.handlers.getobject(ma1.elements.checkboxes.addattachment.id);
        // dropdowns
        ma1.elements.dropdowns.administrator.object = ma1.handlers.getobject(ma1.elements.dropdowns.administrator.id);
        ma1.elements.dropdowns.creditor.object = ma1.handlers.getobject(ma1.elements.dropdowns.creditor.id);
        ma1.elements.dropdowns.maindocument.object = ma1.handlers.getobject(ma1.elements.dropdowns.maindocument.id);
        ma1.elements.dropdowns.attachment.object = ma1.handlers.getobject(ma1.elements.dropdowns.attachment.id);
        // dropdowns event handlers
        ma1.elements.dropdowns.administrator.object.change(function() { ma1.actions.getCreditor(); });
        ma1.elements.dropdowns.creditor.object.change(function() { ma1.actions.getCreditorData(); });
        ma1.elements.dropdowns.maindocument.object.change(function() {});
        ma1.elements.dropdowns.attachment.object.change(function() {});
        // datatables
        ma1.elements.datatables.userfields.object = ma1.handlers.getobject(ma1.elements.datatables.userfields.id);
    },
    primaryData: function() {
        // get administrations
        var getAdministrationsCallback = function(data) {
            ma1.handlers.dropdown.addOptions(ma1.elements.dropdowns.administrator.object, data);
            ma1.actions.getCreditor();
        };
        ma1.getdata.getAdministrations(getAdministrationsCallback);
    }
};

ma1.getdata = {
    // Gets the Administrations
    getAdministrations: function(callback) {
        $.ajax({
            type: "GET",
            url: ma1.routes.getAdministrations,
            dataType: "json",
            success: function(data) {
                callback(data);
            },
            error: function(error) { ma1.helpfunc.serverError(error); }
        });
    },
    // Gets the Creditors
    getCreditors: function(callback) {
        var administration = ma1.handlers.dropdown.getSelectedText(ma1.elements.dropdowns.administrator.object);
        if (administration == '' || administration == undefined) return;
        var values = [{ key: "administration", value: administration }];
        var urn = ma1.handlers.routeUpdate(ma1.routes.getCreditors, values);
        $.ajax({
            type: "GET",
            url: urn,
            dataType: "json",
            success: function(data) {
                callback(data);
            },
            error: function(error) { ma1.helpfunc.serverError(error); }
        });
    },
    // Gets the Creditor Data
    getCreditorData: function(callback) {
        var creditor = ma1.handlers.dropdown.getSelectedText(ma1.elements.dropdowns.creditor.object);
        var administration = ma1.handlers.dropdown.getSelectedText(ma1.elements.dropdowns.administrator.object);
        if (creditor == '' || creditor == undefined || administration == '' || administration == undefined) return;
        var values = [{ key: "creditor", value: creditor.split('-')[0] }, { key: "administration", value: administration }];
        var urn = ma1.handlers.routeUpdate(ma1.routes.getCreditorData, values);
        $.ajax({
            type: "GET",
            url: urn,
            dataType: "json",
            success: function(data) {
                callback(data);
            },
            error: function(error) { ma1.helpfunc.serverError(error); }
        });
    }
};

ma1.setdata = {
    save: function(data, success, error) {
        $.ajax({
            dataType: "json",
            url: ma1.routes.setCreditorData,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function(data, textStatus, jqXHR) { success(data); },
            error: function(jqXHR, textStatus, errorThrown) { error(""); }
        });
    },
    setCreditorData: function(data) {
        ma1.elements.datatables.userfields.data.origin = data;
        ma1.elements.datatables.userfields.data.ID = data.ID;
        ma1.elements.datatables.userfields.data.name = data.name;

        ma1.elements.datatables.userfields.data.administrationID = data.administrationID;
        // set data in document
        ma1.handlers.checkbox.setValue(ma1.elements.checkboxes.addattachment.object, data.addAttachment);
        ma1.handlers.dropdown.setSelectedValue(ma1.elements.dropdowns.maindocument.object, data.mainDocRule);
        ma1.handlers.dropdown.setSelectedValue(ma1.elements.dropdowns.attachment.object, data.attachmentRule);
        ma1.handlers.input.setText(ma1.elements.inputs.maindocument.object, data.mainDocRuleValue);
        ma1.handlers.input.setText(ma1.elements.inputs.mainattachment.object, data.attachmentRuleValue);
    },
};

ma1.actions = {
    save: function() {
        var error = function(data) {
            spop({
                template: '<h4 class="spop-title">Error Save </h4>' + data + '',
                position: 'top-right',
                style: 'error',
                autoclose: 4000
            });
        };
        var success = function(data) {
            if (data) {
                spop({
                    template: '<h4 class="spop-title">Saves the creditor data</h4>Saved successfully',
                    position: 'top-right',
                    style: 'success',
                    autoclose: 4000
                });
            } else {
                error("Invalid data format");
            }
        };
        var data = {
            ID: ma1.elements.datatables.userfields.data.ID,
            administrationID: ma1.elements.datatables.userfields.data.administrationID,
            udfList: ma1.helpfunc.createResAddata(ma1.elements.datatables.userfields.data.aaData),
            addAttachment: ma1.handlers.checkbox.getValue(ma1.elements.checkboxes.addattachment.object),
            mainDocRule: +ma1.handlers.dropdown.getSelectedValue(ma1.elements.dropdowns.maindocument.object),
            attachmentRule: +ma1.handlers.dropdown.getSelectedValue(ma1.elements.dropdowns.attachment.object),
            mainDocRuleValue: ma1.handlers.input.getText(ma1.elements.inputs.maindocument.object),
            attachmentRuleValue: ma1.handlers.input.getText(ma1.elements.inputs.mainattachment.object),
            name: ma1.elements.datatables.userfields.data.name,
        };

        if (ma1.elements.datatables.userfields.state && data.ID != '') {
            ma1.setdata.save(data, success, error);
        } else if (data.ID == '') {
            ma1.helpfunc.userInfo('There is nothing to save');
        } else {
            ma1.helpfunc.editSpop();
        }

    },
    getCreditor: function() {
        ma1.clean.init();
        var getCreditorsCallback = function(data) {
            if (data.length == 0 || typeof data == 'string') {
                ma1.helpfunc.userInfo('Not found creditors');
            }
            ma1.handlers.dropdown.addOptions(ma1.elements.dropdowns.creditor.object, data);
            ma1.actions.getCreditorData();
        };
        ma1.getdata.getCreditors(getCreditorsCallback);
    },
    getCreditorData: function() {
        ma1.clean.init();
        var getCreditorDataCallback = function(data) {
            var keyArr = $.isArray(data);
            var aaData = keyArr ? [] : data;
            if (!keyArr && typeof data != 'string') {
                ma1.setdata.setCreditorData(data);
            } else {
                ma1.helpfunc.userInfo(data);
                return;
            }
            var chengeData = function(data) {
                var res = [];
                for (var key in data) {
                    if ($.isArray(data[key]) && key == 'udfList') {
                        data[key].forEach(function(val, i) {
                            res.push([val.name, val.value]);
                        });
                    }
                }
                return res;
            };
            aaData = chengeData(aaData);
            ma1.elements.datatables.userfields.data.aaData = aaData;
            ma1.handlers.datatables.init(ma1.elements.datatables.userfields, aaData);
        };
        ma1.getdata.getCreditorData(getCreditorDataCallback);
    }
};

ma1.clean = {
    init: function() {
        ma1.clean.objDump();
        ma1.clean.table();
        ma1.clean.document();
    },
    objDump: function() {
        ma1.elements.datatables.userfields.state = true;
        ma1.elements.datatables.userfields.data.origin = {};
        ma1.elements.datatables.userfields.data.ID = '';
        ma1.elements.datatables.userfields.data.name = '';
        ma1.elements.datatables.userfields.data.aaData = [];
        ma1.elements.datatables.userfields.data.administrationID = '';
    },
    table: function() {
        ma1.handlers.datatables.clean(ma1.elements.datatables.userfields);
    },
    document: function() {
        ma1.handlers.checkbox.setValue(ma1.elements.checkboxes.addattachment.object, false);
        ma1.handlers.dropdown.setSelectedValue(ma1.elements.dropdowns.maindocument.object, '1');
        ma1.handlers.dropdown.setSelectedValue(ma1.elements.dropdowns.attachment.object, '1');
        ma1.handlers.input.setText(ma1.elements.inputs.maindocument.object, '');
        ma1.handlers.input.setText(ma1.elements.inputs.mainattachment.object, '');
    }
};


$(function() {
    ma1.init.elements();
    ma1.init.primaryData();
});