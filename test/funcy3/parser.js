/* Jison generated parser */
var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"program":3,"statements":4,"eof":5,"block":6,"indent":7,"dedent":8,"while_statement":9,"while":10,"newline":11,"statement":12,"single_statement":13,"block_statement":14,"proc_call":15,"id":16,"args_list":17,"nonempty_args_list":18,"empty_args_list":19,"comma":20,"arg":21,"expr":22,"add":23,"mul":24,"num":25,"ID":26,"NUM":27,"WHILE":28,"COMMA":29,"NEWLINE":30,"INDENT":31,"DEDENT":32,"EOF":33,"ADD":34,"MUL":35,"$accept":0,"$end":1},
terminals_: {2:"error",26:"ID",27:"NUM",28:"WHILE",29:"COMMA",30:"NEWLINE",31:"INDENT",32:"DEDENT",33:"EOF",34:"ADD",35:"MUL"},
productions_: [0,[3,2],[6,3],[9,3],[4,2],[4,1],[12,2],[12,1],[13,1],[15,2],[17,1],[17,1],[18,3],[18,1],[19,0],[22,3],[22,3],[22,1],[22,1],[14,1],[21,1],[16,1],[25,1],[10,1],[20,1],[11,1],[7,1],[8,1],[5,1],[23,1],[24,1]],
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
case 5: this.$ =   [$$[$0]]; 
break;
case 9: this.$ = {type: "PROC_CALL", name: $$[$0-1], args: $$[$0]}; 
break;
case 12: this.$.push($$[$0]); 
break;
case 13: this.$ =   [$$[$0]]; 
break;
case 14: this.$ = []; 
break;
case 15: this.$ = {type: "ADD", left: $$[$0-2], right: $$[$0]}; 
break;
case 16: this.$ = {type: "MUL", left: $$[$0-2], right: $$[$0]}; 
break;
}
},
table: [{3:1,4:2,9:7,10:9,12:3,13:4,14:5,15:6,16:8,26:[1,10],28:[1,11]},{1:[3]},{5:12,9:7,10:9,12:13,13:4,14:5,15:6,16:8,26:[1,10],28:[1,11],33:[1,14]},{26:[2,5],28:[2,5],32:[2,5],33:[2,5]},{11:15,30:[1,16]},{26:[2,7],28:[2,7],32:[2,7],33:[2,7]},{30:[2,8]},{26:[2,19],28:[2,19],32:[2,19],33:[2,19]},{16:23,17:17,18:18,19:19,21:20,22:21,25:22,26:[1,10],27:[1,24],30:[2,14]},{11:25,30:[1,16]},{26:[2,21],27:[2,21],29:[2,21],30:[2,21],34:[2,21],35:[2,21]},{30:[2,23]},{1:[2,1]},{26:[2,4],28:[2,4],32:[2,4],33:[2,4]},{1:[2,28]},{26:[2,6],28:[2,6],32:[2,6],33:[2,6]},{26:[2,25],28:[2,25],31:[2,25],32:[2,25],33:[2,25]},{30:[2,9]},{20:26,29:[1,27],30:[2,10]},{30:[2,11]},{29:[2,13],30:[2,13]},{23:28,24:29,29:[2,20],30:[2,20],34:[1,30],35:[1,31]},{29:[2,17],30:[2,17],34:[2,17],35:[2,17]},{29:[2,18],30:[2,18],34:[2,18],35:[2,18]},{29:[2,22],30:[2,22],34:[2,22],35:[2,22]},{6:32,7:33,31:[1,34]},{16:23,21:35,22:21,25:22,26:[1,10],27:[1,24]},{26:[2,24],27:[2,24]},{16:23,22:36,25:22,26:[1,10],27:[1,24]},{16:23,22:37,25:22,26:[1,10],27:[1,24]},{26:[2,29],27:[2,29]},{26:[2,30],27:[2,30]},{26:[2,3],28:[2,3],32:[2,3],33:[2,3]},{4:38,9:7,10:9,12:3,13:4,14:5,15:6,16:8,26:[1,10],28:[1,11]},{26:[2,26],28:[2,26]},{29:[2,12],30:[2,12]},{23:28,24:29,29:[2,15],30:[2,15],34:[1,30],35:[1,31]},{23:28,24:29,29:[2,16],30:[2,16],34:[1,30],35:[1,31]},{8:39,9:7,10:9,12:13,13:4,14:5,15:6,16:8,26:[1,10],28:[1,11],32:[1,40]},{26:[2,2],28:[2,2],32:[2,2],33:[2,2]},{26:[2,27],28:[2,27],32:[2,27],33:[2,27]}],
defaultActions: {6:[2,8],11:[2,23],12:[2,1],14:[2,28],17:[2,9],19:[2,11]},
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