/* Jison generated parser */
var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"program":3,"statements":4,"eof":5,"block":6,"indent":7,"dedent":8,"while_statement":9,"while":10,"newline":11,"statement":12,"single_statement":13,"block_statement":14,"proc_call":15,"id":16,"args_list":17,"nonempty_args_list":18,"empty_args_list":19,"comma":20,"arg":21,"num":22,"ID":23,"NUM":24,"WHILE":25,"COMMA":26,"NEWLINE":27,"INDENT":28,"DEDENT":29,"EOF":30,"$accept":0,"$end":1},
terminals_: {2:"error",23:"ID",24:"NUM",25:"WHILE",26:"COMMA",27:"NEWLINE",28:"INDENT",29:"DEDENT",30:"EOF"},
productions_: [0,[3,2],[6,3],[9,3],[4,2],[4,1],[12,2],[12,1],[13,1],[15,2],[17,1],[17,1],[18,3],[18,1],[19,0],[21,1],[21,1],[14,1],[16,1],[22,1],[10,1],[20,1],[11,1],[7,1],[8,1],[5,1]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1: return {type: "BLOCK", statements: $$[$0-1]}; 
break;
case 2: this.$ = $$[$0-1]; 
break;
case 3: this.$ = {type: "WHILE", statements: $$[$0]}; 
break;
case 4: this.$.push($$[$0]); 
break;
case 5: this.$ = [$$[$0]];   
break;
case 9: this.$ = {type: "PROC_CALL", name: $$[$0-1], args: $$[$0]}; 
break;
case 12: this.$.push($$[$0]); 
break;
case 13: this.$ = [$$[$0]]; 
break;
case 14: this.$ = []; 
break;
}
},
table: [{3:1,4:2,9:7,10:9,12:3,13:4,14:5,15:6,16:8,23:[1,10],25:[1,11]},{1:[3]},{5:12,9:7,10:9,12:13,13:4,14:5,15:6,16:8,23:[1,10],25:[1,11],30:[1,14]},{23:[2,5],25:[2,5],29:[2,5],30:[2,5]},{11:15,27:[1,16]},{23:[2,7],25:[2,7],29:[2,7],30:[2,7]},{27:[2,8]},{23:[2,17],25:[2,17],29:[2,17],30:[2,17]},{16:21,17:17,18:18,19:19,21:20,22:22,23:[1,10],24:[1,23],27:[2,14]},{11:24,27:[1,16]},{23:[2,18],24:[2,18],26:[2,18],27:[2,18]},{27:[2,20]},{1:[2,1]},{23:[2,4],25:[2,4],29:[2,4],30:[2,4]},{1:[2,25]},{23:[2,6],25:[2,6],29:[2,6],30:[2,6]},{23:[2,22],25:[2,22],28:[2,22],29:[2,22],30:[2,22]},{27:[2,9]},{20:25,26:[1,26],27:[2,10]},{27:[2,11]},{26:[2,13],27:[2,13]},{26:[2,15],27:[2,15]},{26:[2,16],27:[2,16]},{26:[2,19],27:[2,19]},{6:27,7:28,28:[1,29]},{16:21,21:30,22:22,23:[1,10],24:[1,23]},{23:[2,21],24:[2,21]},{23:[2,3],25:[2,3],29:[2,3],30:[2,3]},{4:31,9:7,10:9,12:3,13:4,14:5,15:6,16:8,23:[1,10],25:[1,11]},{23:[2,23],25:[2,23]},{26:[2,12],27:[2,12]},{8:32,9:7,10:9,12:13,13:4,14:5,15:6,16:8,23:[1,10],25:[1,11],29:[1,33]},{23:[2,2],25:[2,2],29:[2,2],30:[2,2]},{23:[2,24],25:[2,24],29:[2,24],30:[2,24]}],
defaultActions: {6:[2,8],11:[2,20],12:[2,1],14:[2,25],17:[2,9],19:[2,11]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    //this.reductionCount = this.shiftCount = 0;

    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    if (typeof this.lexer.yylloc == 'undefined')
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);

    if (typeof this.yy.parseError === 'function')
        this.parseError = this.yy.parseError;

    function popStack (n) {
        stack.length = stack.length - 2*n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

    function lex() {
        var token;
        token = self.lexer.lex() || 1; // $end = 1
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval={},p,len,newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length-1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null)
                symbol = lex();
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

        // handle parse error
        _handle_error:
        if (typeof action === 'undefined' || !action.length || !action[0]) {

            if (!recovering) {
                // Report error
                expected = [];
                for (p in table[state]) if (this.terminals_[p] && p > 2) {
                    expected.push("'"+this.terminals_[p]+"'");
                }
                var errStr = '';
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + this.terminals_[symbol]+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == 1 /*EOF*/ ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr,
                    {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol == EOF) {
                    throw new Error(errStr || 'Parsing halted.');
                }

                // discard current lookahead and grab another
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            while (1) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    break;
                }
                if (state == 0) {
                    throw new Error(errStr || 'Parsing halted.');
                }
                popStack(1);
                state = stack[stack.length-1];
            }

            preErrorSymbol = symbol; // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {

            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(this.lexer.yytext);
                lstack.push(this.lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = this.lexer.yyleng;
                    yytext = this.lexer.yytext;
                    yylineno = this.lexer.yylineno;
                    yyloc = this.lexer.yylloc;
                    if (recovering > 0)
                        recovering--;
                } else { // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2: // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3: // accept
                return true;
        }

    }

    return true;
}};


return parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    if (typeof process !== 'undefined') {
        var source = require('fs').readFileSync(require('path').join(process.cwd(), args[1]), "utf8");
    } else {
        var cwd = require("file").path(require("file").cwd());
        var source = cwd.join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}