%lex
%%

\n\ *                   { return 'NEWLINE'; };
[ ]+ {
    //console.log("MAGIC:" + yy.magic);
    //console.log("TEST:" + TEST);
    indentation_stack.push(yytext.length);
    console.log("Indentation stack: " + indentation_stack);
    return 'INDENT';
};
"twice"\s+              { return 'TWICE' };
"count"                 { return 'COUNT' };
"skip"                  { return 'SKIP' };
<<EOF>>                 { return 'EOF' };
.                       { return 'INVALID' };

/lex

%start program

%%

program: block 'EOF' {{ return $block; }};

block
    : block 'NEWLINE' statement
    {{ $$.statements.push($3); }}
    | statement
    {{ $$ = {type: "BLOCK", statements: [$statement]}; }}
    ;

statement
    : 'TWICE' statement
    {{ $$ = {type: "TWICE", body: $statement}; }}
    | 'COUNT'
    {{ $$ = {type: "COUNT"}; }}
    | 'SKIP'
    {{ $$ = {type: "SKIP"}; }}
    ;
%%
var indentation_stack = [0];
