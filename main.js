var _latte = {
    the_term: document.getElementById("the_term"),
    the_code: document.getElementById("the_code"),
    DEBUG: true,
    DEBUG_PREFIX: "DEBUG: ",
    autoscroll: null
};

var latte = {
    write: function() {
        var out = _latte.the_term;

        for (var i = 0; i < arguments.length; i++) {
            out.value += String(arguments[i]);
        }

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
    eval(_latte.the_code.value);
}

function on_input_submitted(widget) {
    latte.print("You submitted my input!");
    alert("You submitted my input!");
}

function on_clear_button_clicked(widget) {
    latte.clear_output();
}

function set_code_size(size) {
    var mapping = {
        s:  "10em",
        m:  "15em",
        l:  "24em",
        xl: "30em"
    }

    the_code.style.height = mapping[size];
}

function set_term_size(size) {
    var mapping = {
        s:  "10em",
        m:  "15em",
        l:  "24em",
        xl: "30em"
    }

    the_term.style.height = mapping[size];
}
