%lex
%%

\s+                     { };
"twice"                 { return 'TWICE'; };
"count"                 { return 'COUNT;' };
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
    : 'TWICE' 'BEGIN' block 'END'
    {{ $$ = {type: "TWICE", body: $block}; }}
    | block statement
    {{ $$.statements.push($3); }}
    | statement
    {{ $$ = {type: "BLOCK", statements: [$statement]}; }}
    ;

statement
    : 'COUNT'
    {{ $$ = {type: "COUNT"}; }}
    | 'SKIP'
    {{ $$ = {type: "SKIP"}; }}
    ;
%%
