exports.lexer = {
    lex: function() {
        var matches = this.text.match(this.pattern);
        var indent  = matches[1];
        var id      = matches[2];
        var last_indent = this.indent[this.indent.length - 1];
        if (indent.length > last_indent) {
            this.indent.push(indent.length);
            this.tokens.push({token: 'INDENT', yytext: indent});
        }
        else if (indent.length < last_indent) {
            this.indent.pop();
            this.tokens.push({token: 'DEDENT', yytext: indent});
            this.tokens.push('DEDENT');
        }
        this.yytext = this.tokens[this.i].yytext;
        var next_token = this.tokens[this.i].token;
        console.log(">>> NEXT TOKEN IS", next_token);
        this.i++;
        return next_token;
    },

    setInput: function(str) {
        this.pattern = /(\s*)(\w+)/;
        this.yytext = "";
        this.text   = str;
        this.tokens = [];
        this.indent = [0];
        this.i      = 0;
    }
};
