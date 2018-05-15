var ma2 = {};
ma2.debug = true; // prod  => change to false 
ma2.routes = {};
ma2.routes.root = ma2.debug ? "http://136.144.187.71:91/api/mac/" : "/";
ma2.routes.getOdbcConfiguration = ma2.routes.root + "MACGetODBCConfiguration";
ma2.routes.saveODBCConfiguration = ma2.routes.root + "MACSaveODBCConfiguration";

ma2.elements = {
    buttons: {
        save: { id: "btn_save", object: {} },
    },
    inputs: {
        admconnectionstring: { id: "ipt_adm_connectionstring", object: {} },
        admquery: { id: "ipt_adm_query", object: {} },
        creditorconnectionstring: { id: "ipt_creditor_connectionstring", object: {} },
        creditorquery: { id: "ipt_creditor_query", object: {} }
    }
};

ma2.handlers = {
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
    }
};

ma2.init = {
    elements: function() {
        // buttons
        ma2.elements.buttons.save.object = ma2.handlers.getobject(ma2.elements.buttons.save.id);
        // buttons event handlers
        ma2.elements.buttons.save.object.click(function() { ma2.actions.save(); });
        // inputs
        ma2.elements.inputs.admconnectionstring.object = ma2.handlers.getobject(ma2.elements.inputs.admconnectionstring.id);
        ma2.elements.inputs.admquery.object = ma2.handlers.getobject(ma2.elements.inputs.admquery.id);
        ma2.elements.inputs.creditorconnectionstring.object = ma2.handlers.getobject(ma2.elements.inputs.creditorconnectionstring.id);
        ma2.elements.inputs.creditorquery.object = ma2.handlers.getobject(ma2.elements.inputs.creditorquery.id);
    },
    primaryData: function() {
        var callback = function(data) {
            ma2.handlers.input.setText(ma2.elements.inputs.admconnectionstring.object, data.administrationConnectionstring);
            ma2.handlers.input.setText(ma2.elements.inputs.admquery.object, data.administrationQuery);
            ma2.handlers.input.setText(ma2.elements.inputs.creditorconnectionstring.object, data.creditorConnectionstring);
            ma2.handlers.input.setText(ma2.elements.inputs.creditorquery.object, data.creditorQuery);
        };
        ma2.getdata.getOdbcConfiguration(callback);
    }
};

ma2.getdata = {
    // Gets Odbc Configuration
    getOdbcConfiguration: function(callback) {
        $.get(ma2.routes.getOdbcConfiguration, function(congif) {
            callback(congif);
        });
    },
};

ma2.setdata = {
    save: function(data, success, error) {
        $.ajax({
            url: ma2.routes.saveODBCConfiguration,
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(data),
            success: function(data, textStatus, jqXHR) { success(data); },
            error: function(jqXHR, textStatus, errorThrown) { error(""); }
        });
    },
};

ma2.actions = {
    save: function() {
        var error = function(data) {
            spop({
                template: '<h4 class="spop-title">Saves Administration and Creditors data</h4>Save server error:' + data,
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
            administrationConnectionString: ma2.handlers.input.getText(ma2.elements.inputs.admconnectionstring.object),
            administrationQuery: ma2.handlers.input.getText(ma2.elements.inputs.admquery.object),
            creditorConnectionString: ma2.handlers.input.getText(ma2.elements.inputs.creditorconnectionstring.object),
            creditorQuery: ma2.handlers.input.getText(ma2.elements.inputs.creditorquery.object),
        };
        ma2.setdata.save(data, success, error);
    },
};

$(function() {
    ma2.init.elements();
    ma2.init.primaryData();
});