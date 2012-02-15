exports.lexer = (function() {
    var lexer = {};
    var DEBUG = true;

    function debug() {
        if (DEBUG) {
            console.log.apply(console, arguments);
        }
    }

    function lex() {
        if (lexer.tokens.length > 0) {
            return get_token();
        }

        if (lexer.text === "") {
            debug("<<EOF>>");
            return 'EOF';
        }

        debug("TEXT = '''");
        debug(lexer.text);
        debug("'''");

        for (var n = 0; n < patterns.length; n++) {
            var p = patterns[n];
            var t = try_pattern(p.pattern, p.func);

            if (t) {
                break;
            }
        }

        if (lexer.tokens.length > 0) {
            return get_token();
        }
        else {
            return lex();
        }
    }

    function get_token() {
        var token = lexer.tokens.shift();
        lexer.yytext = token.yytext;
        lexer.token_history.push(token);
        debug("TOKENS =", lexer.tokens);
        debug("TOKEN HISTORY =\n", lexer.token_history);
        return token.token;
    }

    function try_pattern(pattern, func) {
        var matches = lexer.text.match(pattern);

        if (matches === null) {
            return false;
        }
        else {
            func(matches);
            consume(matches[0].length);
            return true;
        }
    }

    // Consumes n characters
    function consume(n) {
        for (var i = 0; i < n; i++) {
            if (lexer.text[i] === "\n") {
                inc_line();
                reset_column();
            }
            else {
                inc_column();
            }
        }
        lexer.text = lexer.text.substr(n);
    }

    function set_input(str) {
        lexer.text = str + "\n";
        lexer.tokens = [];
        lexer.indents = [0];
        lexer.token_history = [];

        lexer.line   = 1;
        lexer.column = 1;
    }

    function inc_line(line) {
        lexer.line++;
    }

    function inc_column() {
        lexer.column++;
    }

    function reset_column() {
        lexer.column = 1;
    }

    function spaced_pattern(type, pattern_fragment) {
        var pattern = new RegExp(/^(\s*)/.source + pattern_fragment.source);
        return {pattern: pattern, func: function(matches) {
            var ws = matches[1];
            var x  = matches[2];
            lexer.tokens.push({token: type, yytext: x});
        }};
    }

    function regular_pattern(type, pattern) {
        return {pattern: pattern, func: function(matches) {
            var x = matches[1];
            lexer.tokens.push({token: type, yytext: x});
        }};
    }

    function unescape(str) {
        return (str
            .replace(/\\n/g,  "\n")
            .replace(/\\"/g,  "\"")
            .replace(/\\\\/g, "\\")
        );
    }

    patterns = [
        // Matches comments
        // (whitespace* comment) LOOKAHEAD(newline)
        {pattern: /^(\s*;.*?)(?=\n)/, func: function(matches) {
        }},

        // Matches newlines and indentation
        // newline whitespace*
        {pattern: /^(\s*\n)([ ]*)/, func: function(matches) {
            lexer.tokens.push({token: "NEWLINE", yytext: "\n"});
            var whole   = matches[0];
            var newline = matches[1];
            var spaces  = matches[2];
            var indent  = spaces.length;
            var last_indent = lexer.indents[lexer.indents.length - 1];
            if (indent > last_indent) {
                lexer.indents.push(indent);
                lexer.tokens.push({token: "INDENT", yytext: spaces});
            }
            else if (indent < last_indent) {
                while (indent < last_indent) {
                    lexer.indents.pop();
                    lexer.tokens.push({token: "DEDENT", yytext: spaces});
                    last_indent = lexer.indents[lexer.indents.length - 1];
                }
            }
        }},

        regular_pattern("FOR",   /^(for)/),
        regular_pattern("WHILE", /^(while)/),
        regular_pattern("UNTIL", /^(until)/),
        regular_pattern("PASS",  /^(pass)/),
        regular_pattern("WITH",  /^(with)/),
        regular_pattern("FUNCTION", /^(function)/),
        regular_pattern("PROCEDURE", /^(procedure)/),
        spaced_pattern("IF",   /(if)/),
        regular_pattern("ELSE", /^(else)/),

        spaced_pattern("IN",     /(in)/),
        spaced_pattern("TO",     /(to)/),
        spaced_pattern("BY",     /(by)/),
        spaced_pattern("FROM",   /(from)/),

        spaced_pattern("LPAREN",   /(\()/),
        spaced_pattern("RPAREN",   /(\))/),
        spaced_pattern("LBRACKET", /(\[)/),
        spaced_pattern("RBRACKET", /(\])/),

        spaced_pattern("COMMA", /(,)/),

        {pattern: /^(\s*)"((?:\\"|[^\"])*?)"/, func: function(matches) {
            var ws  = matches[1];
            var str = matches[2];
            lexer.tokens.push({token: "TEXT", yytext: unescape(str)});
        }},
        spaced_pattern("NUM",   /(\d+\.\d+)/),
        spaced_pattern("NUM",   /(\d+)/),
        spaced_pattern("NOTHING", /(nothing)/),
        spaced_pattern("TRUE",  /(true)/),
        spaced_pattern("FALSE", /(false)/),

        spaced_pattern("ASSIGN", /(:=)/),

        spaced_pattern("LEN", /(#)/),

        spaced_pattern("LE", /(<=)/),
        spaced_pattern("GE", /(>=)/),
        spaced_pattern("LT", /(<)/),
        spaced_pattern("GT", /(>)/),
        spaced_pattern("EQ", /(=)/),

        spaced_pattern("AND", /(and)/),
        spaced_pattern("OR",  /(or)/),
        spaced_pattern("AT",  /(\@)/),
        spaced_pattern("CAT", /(\~)/),
        spaced_pattern("ADD", /(\+)/),
        spaced_pattern("SUB", /(\-)/),
        spaced_pattern("MUL", /(\*)/),
        spaced_pattern("DIV", /(\/)/),
        spaced_pattern("EXP", /(\^)/),

        spaced_pattern("ID", /(\w+)/),
    ];

    lexer.lex = lex;
    lexer.setInput = set_input;

    return lexer;
})();
