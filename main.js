var _latte = {
    the_term: document.getElementById("the_term")
};

var latte = {
    print: function() {
        var out = _latte.the_term;

        for (var i = 0; i < arguments.length; i++) {
            out.innerHTML += String(arguments[i]);
            out.innerHTML += " ";
        }

        out.innerHTML += "\n";
    },

    clearTerminal: function() {
        var out = _latte.the_term;

        out.innerHTML = "";
    }
};

var x = 0;

function on_run_button_clicked(widget) {
    x += 1;
    latte.clearTerminal();
    latte.print(x);
}

function on_save_button_clicked(widget) {
    alert("Save!");
}
