var latte = (function() {
    var the_term = document.getElementById("the_term");
    var the_code = document.getElementById("the_code");

    var write = function() {
        var i;

        for (i = 0; i < arguments.length - 1; i++) {
            the_term.value += String(arguments[i]) + " ";
        }
        the_term.value += String(arguments[i]);

        // Scroll down
        the_term.scrollTop = the_term.scrollHeight;
    };

    var print = function() {
        write.apply(this, arguments);
        write("\n");
    };

    var debug = function() {
        if (! DEBUG)
            return;

        write(DEBUG_PREFIX);
        print.apply(this, arguments);
    };

    var clear_output = function() {
        the_term.value = "";
    };

    var get_size = function(size) {
        return {
            s:  "10em",
            m:  "15em",
            l:  "24em",
            xl: "30em"
        }[size];
    };

    var get_code = function() {
        return the_code.value;
    };

    return {
        clear_output: clear_output,

        get_size: get_size,
        get_code: get_code,

        write: write,
        print: print,
        debug: debug
    };
})();

function on_run_button_clicked(widget) {
    latte.clear_output();

    // Clear previous subroutine definitions.
    ls.dispatch.clear();

    // Enable the event queue.
    ls.helpers.reset();

    var func = ls.latte.compile(latte.get_code());
    func();
}

function on_stop_button_clicked(widget) {
    ls.helpers.quit();
}

function on_input_submitted(widget) {
    latte.print("You submitted my input!");
    alert("You submitted my input!");
}

function set_size(id, size) {
    var widget = document.getElementById(id);
    widget.style.height = latte.get_size(size);
}
