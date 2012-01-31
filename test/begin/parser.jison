%lex
%%

\s+                     { };
"twice"                 { return 'TWICE'; };
"count"                 { return 'COUNT'; };
"skip"                  { return 'SKIP'; };
"begin"                 { return 'BEGIN'; };
"end"                   { return 'END'; };
<<EOF>>                 { return 'EOF'; };
.                       { return 'INVALID'; };

/lex

%start program

%%

program
    : block 'EOF'
    {{ return $block; }}
    ;

block
    : block statement
    {{ $$.statements.push($statement); }}
    | statement
    {{ $$ = {type: "BLOCK", statements: [$statement]}; }}
    ;

statement
    : 'TWICE' 'BEGIN' block 'END'
    {{ $$ = {type: "TWICE", body: $block}; }}
    | 'COUNT'
    {{ $$ = {type: "COUNT"}; }}
    | 'SKIP'
    {{ $$ = {type: "SKIP"}; }}
    ;
%%
