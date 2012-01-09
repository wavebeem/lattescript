var _latte = {
    the_term: document.getElementById("the_term"),
    the_code: document.getElementById("the_code"),
    DEBUG: true,
    DEBUG_PREFIX: "DEBUG: ",
};

var latte = {
    write: function() {
        var out = _latte.the_term;

        for (var i = 0; i < arguments.length; i++) {
            out.value += String(arguments[i]);
        }
    },

    print: function() {
        this.write.apply(this, arguments);
        this.write("\n");
    },

    debug: function() {
        if (! _latte.DEBUG)
            return;

        this.write(_latte.DEBUG_PREFIX);
        this.print.apply(this, arguments);
    },

    clear_output: function() {
        var out = _latte.the_term;

        out.value = "";
    }
};

var x = 0;

function on_test_button_clicked(widget) {
    x += 1;
    latte.clear_output();
    latte.write(">>> ");
    latte.print("iteration ", "number ", x);
    latte.write("You said \"");
    latte.write(_latte.the_code.value);
    latte.print("\"");
}

function on_save_button_clicked(widget) {
    latte.debug("Saved!");
}

function on_run_button_clicked(widget) {
    latte.clear_output();
    eval(_latte.the_code.value);
}
