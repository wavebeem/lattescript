var latte = (function() {
    var the_term  = document.getElementById("the_term");
    var the_code  = document.getElementById("the_code");
    var the_input = document.getElementById("the_input");
    var the_stack = document.getElementById("the_stack");
    var the_run_button    = document.getElementById("the_run_button");
    var the_stop_button   = document.getElementById("the_stop_button");
    var the_submit_button = document.getElementById("the_submit_button");
    var the_clear_button  = document.getElementById("the_clear_button");

    the_stop_button  .disabled = true;
    the_submit_button.disabled = true;
    the_clear_button .disabled = true;

    var manage_input_buttons = function() {
        var empty = the_input.value.length === 0;
        the_clear_button.disabled = empty;
    }

    the_input.onkeypress = function(evt) {
        var key_enter = 13;
        if (evt.keyCode === key_enter) {
            on_input_submitted();
        }

        manage_input_buttons();
    };

    the_input.onchange = manage_input_buttons;
    the_input.onkeyup  = manage_input_buttons;

    var widgets = {
        the_term:  the_term,
        the_code:  the_code,
        the_input: the_input,
        the_run_button: the_run_button
    };

    var output_buffer = "";

    var load = function() {
        if (window.localStorage) {
            var loc = window.localStorage;
            var txt = loc.getItem("code");
            if (typeof(txt) === "string") {
                the_code.value = txt;
            }
        }
    };

    var select_line = function(lineno) {
        the_code.focus();

        var begin = 0;
        var end = 0;
        var code = get_code() + "\n";
        var i = 0;
        var j = 0;

        while (begin < lineno) {
            j = i;
            i = code.indexOf("\n", i + 1);
            if (i >= 0)
                begin++;
        }

        begin = j + 1;
        end = code.indexOf("\n", begin);

        // Good browser
        if (the_code.setSelectionRange) {
            the_code.setSelectionRange(begin, end);
        }
        // Bad browser
        else {
            var r = the_code.createTextRange();
            r.collapse(true);
            r.moveEnd('character', end);
            r.moveStart('character', begin);
            r.select();
        }
    };

    var save = function() {
        if (window.localStorage) {
            var loc = window.localStorage;
            var txt = the_code.value
            if (txt.length > 0)
                loc.setItem("code", txt);
        }
    };

    // Save upon blurring the code textarea...
    // ...and unloading the page...
    // ...and periodically.
    the_code.onblur = save;
    window.onunload = save;
    setInterval(save, 10 * 1000);

    var submit_input = function() {
        var txt = the_input.value;
        the_input.value = "";
        ls.dispatch.set_input(txt);
    };

    var focus_input = function() {
        the_input.focus();
    }

    var height_delta_by_id = (function() {
        var defc = 15;
        var deft =  7;

        var heights    = {the_code: defc,     the_term: deft};
        var defaults   = {the_code: defc,     the_term: deft};
        var resizables = {the_code: the_code, the_term: the_term};

        setTimeout(function() {
            the_code.className += " animated-resize";
            the_term.className += " animated-resize";
        }, 100);

        var max = Math.max;
        var smallest = 5;

        // Load last used values if possible.
        if (window.localStorage) {
            var loc = window.localStorage;

            var load_for_id = function(id) {
                var key = "height." + id;
                var val = loc.getItem(key);
                var n;

                if (! val)
                    n = defaults[id];
                else
                    n = max(smallest, Number(val));

                heights[id] = n;
                widgets[id].style.height = n + "em";
            };

            load_for_id("the_code");
            load_for_id("the_term");
        }
        else {
            the_code.style.height = defc;
            the_term.style.height = deft;
        }

        return function(id, delta) {
            if (delta !== 0)
                heights[id] = max(smallest, heights[id] + delta);
            else
                heights[id] = defaults[id];

            resizables[id].style.height = heights[id] + "em";

            // Store the new value later.
            setTimeout(function() {
                if (window.localStorage) {
                    var loc = window.localStorage;
                    loc.setItem("height." + id, "" + heights[id]);
                }
            }, 0);
        };
    })();

    var show_stack_trace = function(stack_trace) {
        the_stack.style.display = "block";
        the_stack.innerHTML = "";
        var i;
        for (i = 0; i < stack_trace.length; i++) {
            var frame = stack_trace[i];
            var line = frame.line;
            var type = frame.type;
            var name = frame.name;
            var text = frame.text;

            var el = document.createElement("div");
            var link = document.createElement("a");
            link.href = "javascript:latte.select_line(" + line + ");";
            link.innerText   = "line " + line;
            link.textContent = "line " + line;

            el.appendChild(document.createTextNode("- "));
            if (line !== undefined) {
                el.appendChild(document.createTextNode("at "));
                el.appendChild(link);
                el.appendChild(document.createTextNode(" "));
            }
            if (type !== undefined && name !== undefined) {
                el.appendChild(document.createTextNode("in " + type + " " + name));
            }
            if (text !== undefined) {
                el.appendChild(document.createTextNode("near " + text));
            }
            the_stack.appendChild(el);
        }
        blink_stack();
    };

    var hide_stack_trace = function() {
        the_stack.style.display = "none";
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
    var blink_stack = make_css_classes_blinker(the_stack, ["colored", "error"]);

    var enable_submit = function() {
        the_submit_button.disabled = false;
    };

    var start = function() {
        hide_stack_trace();
        the_run_button .disabled = true;
        the_stop_button.disabled = false;
        the_code       .disabled = true;
        var f = ls.latte.compile(latte.get_code());
        f(finish);
    };

    var finish = function() {
        ls.helpers.quit();
        the_run_button   .disabled = false;
        the_stop_button  .disabled = true;
        the_submit_button.disabled = true;
        the_code         .disabled = false;
    };

    var get_code = function() {
        return the_code.value;
    };

    the_run_button.onclick = function() {
        // Quit the previous run.
        ls.helpers.quit();

        // Clear previous subroutine definitions.
        ls.dispatch.clear();

        // Enable the event queue.
        ls.helpers.reset();

        clear_output();

        start();
    };

    the_stop_button.onclick = function() {
        print("<QUIT>");
        finish();
    };

    the_clear_button.onclick = function() {
        clear_input();
        manage_input_buttons();
    };

    var on_input_submitted = function() {
        submit_input();
        manage_input_buttons();
    };

    (function() {
        var f      = height_delta_by_id;
        var ids    = ["the_code", "the_term"];
        var deltas = [+3, -3, 0];
        for (var i=0; i < 3; i++) {
            for (var n=0; n < ids.length; n++) {
                var id = ids[n];
                var d  = deltas[i];
                var e  = document.getElementById(id + "_resizer_" + i);
                // Two layers deep to capture the VALUES of id and delta,
                // rather than just references to them.
                e.onclick = (function(id, d) {
                    return function() {
                        f(id, d);
                    };
                })(id, d);
            }
        }
    })();

    the_submit_button.onclick = on_input_submitted;

    // Load saved settings from local storage.
    load();

    return {
        show_stack_trace: show_stack_trace,
        enable_submit: enable_submit,
        clear_output: clear_output,
        select_line: select_line,
        focus_input: focus_input,
        blink_input: blink_input,
        blink_stack: blink_stack,
        blink_term: blink_term,

        finish: finish,

        get_code: get_code,

        write: write,
        print: print
    };
})();
