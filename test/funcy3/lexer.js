exports.lexer = (function() {
    var lexer = {};

    function lex() {
        if (lexer.tokens.length > 0) {
            return get_token();
        }

        if (lexer.text === "") {
            console.log("<<EOF>>");
            return 'EOF';
        }

        console.log("TEXT = '''");
        console.log(lexer.text);
        console.log("'''");

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
        console.log("TOKENS =", lexer.tokens);
        console.log("TOKEN HISTORY =\n", lexer.token_history);
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

        regular_pattern("WHILE", /^(while)/),
        regular_pattern("PASS",  /^(pass)/),

        spaced_pattern("LPAREN", /(\()/),
        spaced_pattern("RPAREN", /(\))/),
        spaced_pattern("COMMA", /(,)/),

        spaced_pattern("NUM", /([+-]?\d+)/),
        spaced_pattern("ID",  /(\w+)/),

        spaced_pattern("ADD", /(\+)/),
        spaced_pattern("SUB", /(\-)/),
        spaced_pattern("MUL", /(\*)/),
        spaced_pattern("DIV", /(\/)/),
        spaced_pattern("EXP", /(\^)/),
    ];

    lexer.lex = lex;
    lexer.setInput = set_input;

    return lexer;
})();
