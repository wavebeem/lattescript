var _latte = {
    the_term: document.getElementById("the_term"),
    the_code: document.getElementById("the_code"),
    DEBUG: true,
    DEBUG_PREFIX: "DEBUG: ",
    autoscroll: null,
    size_mapping: {
        s:  "10em",
        m:  "15em",
        l:  "24em",
        xl: "30em"
    }
};

var latte = {
    write: function() {
        var out = _latte.the_term;
        var i;

        for (i = 0; i < arguments.length - 1; i++) {
            out.value += String(arguments[i]) + " ";
        }
        out.value += String(arguments[i]);

        function scrollDown() {
            out.scrollTop = out.scrollHeight;
        }
        clearTimeout(_latte.autoscroll);
        _latte.autoscroll = setTimeout(scrollDown, 100);
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
    //eval(_latte.the_code.value);
    var func = ls.compile(_latte.the_code.value);
    func();
}

function on_input_submitted(widget) {
    latte.print("You submitted my input!");
    alert("You submitted my input!");
}

function on_clear_button_clicked(widget) {
    latte.clear_output();
}

function set_code_size(size) {
    _latte.the_code.style.height = _latte.size_mapping[size];
}

function set_term_size(size) {
    _latte.the_term.style.height = _latte.size_mapping[size];
}
