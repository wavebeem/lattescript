var latte = (function() {
    var the_term  = document.getElementById("the_term");
    var the_code  = document.getElementById("the_code");
    var the_input = document.getElementById("the_input");
    var the_run_button = document.getElementById("the_run_button");

    var output_buffer = "";

    var submit_input = function() {
        var txt = the_input.value;
        ls.dispatch.set_input(txt);
    };

    var write = function() {
        if (output_buffer.length > 0) {
            the_term.value += output_buffer;
            output_buffer = "";
        }

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
        output_buffer = "\n";
    };

    var debug = function() {
        if (! DEBUG)
            return;

        write(DEBUG_PREFIX);
        print.apply(this, arguments);
    };

    var clear_output = function() {
        the_term.value = "";
        output_buffer = "";
    };

    var clear_input = function() {
        the_input.value = "";
    }

    var get_size = function(size) {
        return {
            s:  "10em",
            m:  "15em",
            l:  "24em",
            xl: "30em"
        }[size];
    };

    var start = function() {
        the_run_button.disabled = true;
        var f = ls.latte.compile(latte.get_code());
        f(finish);
    };

    var finish = function() {
        ls.helpers.quit();
        the_run_button.disabled = false;
    };

    var get_code = function() {
        return the_code.value;
    };

    return {
        submit_input: submit_input,
        clear_output: clear_output,
        clear_input: clear_input,

        finish: finish,
        start: start,

        get_size: get_size,
        get_code: get_code,

        write: write,
        print: print,
        debug: debug
    };
})();

function on_run_button_clicked(widget) {
    // Quit the previous run.
    ls.helpers.quit();

    // Clear previous subroutine definitions.
    ls.dispatch.clear();

    // Enable the event queue.
    ls.helpers.reset();

    latte.clear_output();

    latte.start();
}

function on_stop_button_clicked(widget) {
    latte.print("<QUIT>");
    latte.finish();
}

function on_clear_button_clicked(widget) {
    latte.clear_input();
}

function on_input_submitted(widget) {
    latte.submit_input();
}

function set_size(id, size) {
    var widget = document.getElementById(id);
    widget.style.height = latte.get_size(size);
}
