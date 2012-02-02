// XXX REMEMBER TO ONLY CHECK FOR INDENTATION IMMEDIATELY AFTER NEWLINES
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
        //lexer.token_history.push(token.token);
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
            //console.log("MATCHED \"" + matches[0] + "\"");
            func(matches);
            lexer.text = lexer.text.substr(matches[0].length);
            return true;
        }
    }

    function set_input(str) {
        lexer.text = str + "\n";
        //lexer.text = str;
        lexer.tokens = [];
        lexer.indents = [0];
        lexer.token_history = [];

        lexer.first_line   = 1;
        lexer.first_column = 1;
        lexer.last_line    = 1;
        lexer.last_column  = 1;
    }

    function inc_line(line) {
        lexer.first_line++;
        lexer.last_line++;
    }

    function inc_column() {
        lexer.first_column++;
        lexer.last_column++;
    }

    function reset_column() {
        lexer.first_column = 1;
        lexer.last_column  = 1;
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
            inc_line();
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
                lexer.indents.pop();
                lexer.tokens.push({token: "DEDENT", yytext: spaces});
            }
        }},

        // Matches ``while''
        {pattern: /^(while)/, func: function(matches) {
            lexer.tokens.push({token: "WHILE", yytext: "while"});
        }},

        // Matches identifiers
        {pattern: /^(\w+)/, func: function(matches) {
            var id = matches[1];
            lexer.tokens.push({token: "ID", yytext: id});
        }},
    ];

    lexer.lex = lex;
    lexer.setInput = set_input;

    return lexer;
})();
