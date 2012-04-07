var latte = (function() {
    var the_term  = document.getElementById("the_term");
    var the_code  = document.getElementById("the_code");
    var the_input = document.getElementById("the_input");
    var the_run_button = document.getElementById("the_run_button");

    var output_buffer = "";

    var submit_input = function() {
        var txt = the_input.value;
        the_input.value = "";
        ls.dispatch.set_input(txt);
    };

    var height_delta_by_id = (function() {
        var defc = 15;
        var deft = 10;
        the_code.style.height = defc + "em";
        the_term.style.height = deft + "em";

        var heights    = {the_code: defc,     the_term: deft};
        var defaults   = {the_code: defc,     the_term: deft};
        var resizables = {the_code: the_code, the_term: the_term};

        var max = Math.max;
        var smallest = 5;

        return function(id, delta) {
            if (delta !== 0)
                heights[id] = max(smallest, heights[id] + delta);
            else
                heights[id] = defaults[id];

            resizables[id].style.height = heights[id] + "em";
        };
    })();

    // Insert "Input:" text into the input field as a hint.
    (function() {
        var default_value = "Input:"
        the_input.value = default_value;

        the_input.onfocus = function() {
            if (this.value === default_value)
                this.value = "";

            return false;
        };

        the_input.onblur = function() {
            if (this.value === "")
                this.value = default_value;

            return false;
        };
    })();

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
        the_input.onblur();
    }

    var make_css_classes_blinker = function(widget, css_classes) {
        return function() {
            var delay = 400;

            var toggle = function() {
                var i;
                for (i = 0; i < css_classes.length; i++) {
                    var css_class = css_classes[i];
                    var classes = widget.className.split(/\s+/);
                    var idx = classes.indexOf(css_class);

                    if (idx < 0) {
                        classes.push(css_class);
                    }
                    else {
                        classes = classes.filter(function(x) {
                            return x !== css_class
                        });
                    }

                    widget.className = classes.join(" ");
                }
            };

            toggle();
            setTimeout(toggle, delay);
        };
    };

    var blink_input = make_css_classes_blinker(the_input, ["colored", "notification"]);
    var blink_term  = make_css_classes_blinker(the_term,  ["colored", "error"]);

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
        height_delta_by_id: height_delta_by_id,
        submit_input: submit_input,
        clear_output: clear_output,
        clear_input: clear_input,
        blink_input: blink_input,
        blink_term: blink_term,

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

function   grow_by_id(id) { latte.height_delta_by_id(id, +5); }
function shrink_by_id(id) { latte.height_delta_by_id(id, -5); }
function  reset_by_id(id) { latte.height_delta_by_id(id,  0); }

// Submit the input when you hit Enter.
(function() {
    var key_enter = 13;
    var the_input = document.getElementById("the_input");
    the_input.onkeypress = function(evt) {
        if (evt.keyCode === key_enter) {
            on_input_submitted();
        }
    };
})();

function set_size(id, size) {
    var widget = document.getElementById(id);
    widget.style.height = latte.get_size(size);
}
