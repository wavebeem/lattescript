/* Jison generated parser */
var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"program":3,"statements":4,"eof":5,"block":6,"indent":7,"dedent":8,"while_statement":9,"while":10,"newline":11,"statement":12,"single_statement":13,"block_statement":14,"proc_call":15,"pass":16,"id":17,"args_list":18,"nonempty_args_list":19,"empty_args_list":20,"comma":21,"arg":22,"expr":23,"bin_op":24,"lparen":25,"rparen":26,"num":27,"add":28,"sub":29,"mul":30,"div":31,"exp":32,"PASS":33,"ID":34,"NUM":35,"WHILE":36,"COMMA":37,"NEWLINE":38,"INDENT":39,"DEDENT":40,"EOF":41,"ADD":42,"SUB":43,"MUL":44,"DIV":45,"EXP":46,"LPAREN":47,"RPAREN":48,"$accept":0,"$end":1},
terminals_: {2:"error",33:"PASS",34:"ID",35:"NUM",36:"WHILE",37:"COMMA",38:"NEWLINE",39:"INDENT",40:"DEDENT",41:"EOF",42:"ADD",43:"SUB",44:"MUL",45:"DIV",46:"EXP",47:"LPAREN",48:"RPAREN"},
productions_: [0,[3,2],[6,3],[9,3],[4,2],[4,1],[12,2],[12,1],[12,1],[13,1],[13,1],[15,2],[18,1],[18,1],[19,3],[19,1],[20,0],[23,3],[23,3],[23,1],[23,1],[24,1],[24,1],[24,1],[24,1],[24,1],[14,1],[16,1],[22,1],[17,1],[27,1],[10,1],[21,1],[11,1],[7,1],[8,1],[5,1],[28,1],[29,1],[30,1],[31,1],[32,1],[25,1],[26,1]],
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
case 8: this.$ = {type: "NOOP"}; 
break;
case 11: this.$ = {type: "PROC_CALL", name: $$[$0-1], args: $$[$0]}; 
break;
case 14: this.$.push($$[$0]); 
break;
case 15: this.$ =   [$$[$0]]; 
break;
case 16: this.$ = []; 
break;
case 17: this.$ = {type: $$[$0-1], left: $$[$0-2], right: $$[$0]}; 
break;
case 18: this.$ = $$[$0-1]; 
break;
case 27: this.$ = {type: "NOOP"}; 
break;
}
},
table: [{3:1,4:2,9:9,10:13,11:6,12:3,13:4,14:5,15:7,16:8,17:11,33:[1,12],34:[1,14],36:[1,15],38:[1,10]},{1:[3]},{5:16,9:9,10:13,11:6,12:17,13:4,14:5,15:7,16:8,17:11,33:[1,12],34:[1,14],36:[1,15],38:[1,10],41:[1,18]},{33:[2,5],34:[2,5],36:[2,5],38:[2,5],40:[2,5],41:[2,5]},{11:19,38:[1,10]},{33:[2,7],34:[2,7],36:[2,7],38:[2,7],40:[2,7],41:[2,7]},{33:[2,8],34:[2,8],36:[2,8],38:[2,8],40:[2,8],41:[2,8]},{38:[2,9]},{38:[2,10]},{33:[2,26],34:[2,26],36:[2,26],38:[2,26],40:[2,26],41:[2,26]},{33:[2,33],34:[2,33],36:[2,33],38:[2,33],39:[2,33],40:[2,33],41:[2,33]},{17:27,18:20,19:21,20:22,22:23,23:24,25:25,27:26,34:[1,14],35:[1,29],38:[2,16],47:[1,28]},{38:[2,27]},{11:30,38:[1,10]},{34:[2,29],35:[2,29],37:[2,29],38:[2,29],42:[2,29],43:[2,29],44:[2,29],45:[2,29],46:[2,29],47:[2,29],48:[2,29]},{38:[2,31]},{1:[2,1]},{33:[2,4],34:[2,4],36:[2,4],38:[2,4],40:[2,4],41:[2,4]},{1:[2,36]},{33:[2,6],34:[2,6],36:[2,6],38:[2,6],40:[2,6],41:[2,6]},{38:[2,11]},{21:31,37:[1,32],38:[2,12]},{38:[2,13]},{37:[2,15],38:[2,15]},{24:33,28:34,29:35,30:36,31:37,32:38,37:[2,28],38:[2,28],42:[1,39],43:[1,40],44:[1,41],45:[1,42],46:[1,43]},{17:27,23:44,25:25,27:26,34:[1,14],35:[1,29],47:[1,28]},{37:[2,19],38:[2,19],42:[2,19],43:[2,19],44:[2,19],45:[2,19],46:[2,19],48:[2,19]},{37:[2,20],38:[2,20],42:[2,20],43:[2,20],44:[2,20],45:[2,20],46:[2,20],48:[2,20]},{34:[2,42],35:[2,42],47:[2,42]},{37:[2,30],38:[2,30],42:[2,30],43:[2,30],44:[2,30],45:[2,30],46:[2,30],48:[2,30]},{6:45,7:46,39:[1,47]},{17:27,22:48,23:24,25:25,27:26,34:[1,14],35:[1,29],47:[1,28]},{34:[2,32],35:[2,32],47:[2,32]},{17:27,23:49,25:25,27:26,34:[1,14],35:[1,29],47:[1,28]},{34:[2,21],35:[2,21],47:[2,21]},{34:[2,22],35:[2,22],47:[2,22]},{34:[2,23],35:[2,23],47:[2,23]},{34:[2,24],35:[2,24],47:[2,24]},{34:[2,25],35:[2,25],47:[2,25]},{34:[2,37],35:[2,37],47:[2,37]},{34:[2,38],35:[2,38],47:[2,38]},{34:[2,39],35:[2,39],47:[2,39]},{34:[2,40],35:[2,40],47:[2,40]},{34:[2,41],35:[2,41],47:[2,41]},{24:33,26:50,28:34,29:35,30:36,31:37,32:38,42:[1,39],43:[1,40],44:[1,41],45:[1,42],46:[1,43],48:[1,51]},{33:[2,3],34:[2,3],36:[2,3],38:[2,3],40:[2,3],41:[2,3]},{4:52,9:9,10:13,11:6,12:3,13:4,14:5,15:7,16:8,17:11,33:[1,12],34:[1,14],36:[1,15],38:[1,10]},{33:[2,34],34:[2,34],36:[2,34],38:[2,34]},{37:[2,14],38:[2,14]},{24:33,28:34,29:35,30:36,31:37,32:38,37:[2,17],38:[2,17],42:[1,39],43:[1,40],44:[1,41],45:[1,42],46:[1,43],48:[2,17]},{37:[2,18],38:[2,18],42:[2,18],43:[2,18],44:[2,18],45:[2,18],46:[2,18],48:[2,18]},{37:[2,43],38:[2,43],42:[2,43],43:[2,43],44:[2,43],45:[2,43],46:[2,43],48:[2,43]},{8:53,9:9,10:13,11:6,12:17,13:4,14:5,15:7,16:8,17:11,33:[1,12],34:[1,14],36:[1,15],38:[1,10],40:[1,54]},{33:[2,2],34:[2,2],36:[2,2],38:[2,2],40:[2,2],41:[2,2]},{33:[2,35],34:[2,35],36:[2,35],38:[2,35],40:[2,35],41:[2,35]}],
defaultActions: {7:[2,9],8:[2,10],12:[2,27],15:[2,31],16:[2,1],18:[2,36],20:[2,11],22:[2,13]},
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