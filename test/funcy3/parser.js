/* Jison generated parser */
var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"program":3,"statements":4,"eof":5,"block":6,"indent":7,"dedent":8,"while_statement":9,"while":10,"newline":11,"statement":12,"single_statement":13,"block_statement":14,"proc_call":15,"id":16,"args_list":17,"nonempty_args_list":18,"empty_args_list":19,"comma":20,"arg":21,"expr":22,"bin_op":23,"lparen":24,"rparen":25,"num":26,"add":27,"sub":28,"mul":29,"div":30,"exp":31,"ID":32,"NUM":33,"WHILE":34,"COMMA":35,"NEWLINE":36,"INDENT":37,"DEDENT":38,"EOF":39,"ADD":40,"SUB":41,"MUL":42,"DIV":43,"EXP":44,"LPAREN":45,"RPAREN":46,"$accept":0,"$end":1},
terminals_: {2:"error",32:"ID",33:"NUM",34:"WHILE",35:"COMMA",36:"NEWLINE",37:"INDENT",38:"DEDENT",39:"EOF",40:"ADD",41:"SUB",42:"MUL",43:"DIV",44:"EXP",45:"LPAREN",46:"RPAREN"},
productions_: [0,[3,2],[6,3],[9,3],[4,2],[4,1],[12,2],[12,1],[12,1],[13,1],[15,2],[17,1],[17,1],[18,3],[18,1],[19,0],[22,3],[22,3],[22,1],[22,1],[23,1],[23,1],[23,1],[23,1],[23,1],[14,1],[21,1],[16,1],[26,1],[10,1],[20,1],[11,1],[7,1],[8,1],[5,1],[27,1],[28,1],[29,1],[30,1],[31,1],[24,1],[25,1]],
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
case 10: this.$ = {type: "PROC_CALL", name: $$[$0-1], args: $$[$0]}; 
break;
case 13: this.$.push($$[$0]); 
break;
case 14: this.$ =   [$$[$0]]; 
break;
case 15: this.$ = []; 
break;
case 16: this.$ = {type: $$[$0-1], left: $$[$0-2], right: $$[$0]}; 
break;
case 17: this.$ = $$[$0-1]; 
break;
}
},
table: [{3:1,4:2,9:8,10:11,11:6,12:3,13:4,14:5,15:7,16:10,32:[1,12],34:[1,13],36:[1,9]},{1:[3]},{5:14,9:8,10:11,11:6,12:15,13:4,14:5,15:7,16:10,32:[1,12],34:[1,13],36:[1,9],39:[1,16]},{32:[2,5],34:[2,5],36:[2,5],38:[2,5],39:[2,5]},{11:17,36:[1,9]},{32:[2,7],34:[2,7],36:[2,7],38:[2,7],39:[2,7]},{32:[2,8],34:[2,8],36:[2,8],38:[2,8],39:[2,8]},{36:[2,9]},{32:[2,25],34:[2,25],36:[2,25],38:[2,25],39:[2,25]},{32:[2,31],34:[2,31],36:[2,31],37:[2,31],38:[2,31],39:[2,31]},{16:25,17:18,18:19,19:20,21:21,22:22,24:23,26:24,32:[1,12],33:[1,27],36:[2,15],45:[1,26]},{11:28,36:[1,9]},{32:[2,27],33:[2,27],35:[2,27],36:[2,27],40:[2,27],41:[2,27],42:[2,27],43:[2,27],44:[2,27],45:[2,27],46:[2,27]},{36:[2,29]},{1:[2,1]},{32:[2,4],34:[2,4],36:[2,4],38:[2,4],39:[2,4]},{1:[2,34]},{32:[2,6],34:[2,6],36:[2,6],38:[2,6],39:[2,6]},{36:[2,10]},{20:29,35:[1,30],36:[2,11]},{36:[2,12]},{35:[2,14],36:[2,14]},{23:31,27:32,28:33,29:34,30:35,31:36,35:[2,26],36:[2,26],40:[1,37],41:[1,38],42:[1,39],43:[1,40],44:[1,41]},{16:25,22:42,24:23,26:24,32:[1,12],33:[1,27],45:[1,26]},{35:[2,18],36:[2,18],40:[2,18],41:[2,18],42:[2,18],43:[2,18],44:[2,18],46:[2,18]},{35:[2,19],36:[2,19],40:[2,19],41:[2,19],42:[2,19],43:[2,19],44:[2,19],46:[2,19]},{32:[2,40],33:[2,40],45:[2,40]},{35:[2,28],36:[2,28],40:[2,28],41:[2,28],42:[2,28],43:[2,28],44:[2,28],46:[2,28]},{6:43,7:44,37:[1,45]},{16:25,21:46,22:22,24:23,26:24,32:[1,12],33:[1,27],45:[1,26]},{32:[2,30],33:[2,30],45:[2,30]},{16:25,22:47,24:23,26:24,32:[1,12],33:[1,27],45:[1,26]},{32:[2,20],33:[2,20],45:[2,20]},{32:[2,21],33:[2,21],45:[2,21]},{32:[2,22],33:[2,22],45:[2,22]},{32:[2,23],33:[2,23],45:[2,23]},{32:[2,24],33:[2,24],45:[2,24]},{32:[2,35],33:[2,35],45:[2,35]},{32:[2,36],33:[2,36],45:[2,36]},{32:[2,37],33:[2,37],45:[2,37]},{32:[2,38],33:[2,38],45:[2,38]},{32:[2,39],33:[2,39],45:[2,39]},{23:31,25:48,27:32,28:33,29:34,30:35,31:36,40:[1,37],41:[1,38],42:[1,39],43:[1,40],44:[1,41],46:[1,49]},{32:[2,3],34:[2,3],36:[2,3],38:[2,3],39:[2,3]},{4:50,9:8,10:11,11:6,12:3,13:4,14:5,15:7,16:10,32:[1,12],34:[1,13],36:[1,9]},{32:[2,32],34:[2,32],36:[2,32]},{35:[2,13],36:[2,13]},{23:31,27:32,28:33,29:34,30:35,31:36,35:[2,16],36:[2,16],40:[1,37],41:[1,38],42:[1,39],43:[1,40],44:[1,41],46:[2,16]},{35:[2,17],36:[2,17],40:[2,17],41:[2,17],42:[2,17],43:[2,17],44:[2,17],46:[2,17]},{35:[2,41],36:[2,41],40:[2,41],41:[2,41],42:[2,41],43:[2,41],44:[2,41],46:[2,41]},{8:51,9:8,10:11,11:6,12:15,13:4,14:5,15:7,16:10,32:[1,12],34:[1,13],36:[1,9],38:[1,52]},{32:[2,2],34:[2,2],36:[2,2],38:[2,2],39:[2,2]},{32:[2,33],34:[2,33],36:[2,33],38:[2,33],39:[2,33]}],
defaultActions: {7:[2,9],13:[2,29],14:[2,1],16:[2,34],18:[2,10],20:[2,12]},
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