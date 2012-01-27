%lex
%%

\n                      { return 'NEWLINE'; };
\s+                     { return 'SPACE+' };
"twice"                 { return 'twice' };
"hello"                 { return 'hello' };
"newline"               { return 'newline' };
<<EOF>>                 { return 'EOF' };
.                       { return 'INVALID' };

/lex

%start program

%%

program
    : block EOF
    {{ return $1; }}
    ;

block
    : block 'NEWLINE' statement
    {{ $$.statements.push($3); }}
    | statement
    {{ $$ = {type: "block", statements: [$1]}; }}
    ;

statement
    : 'twice' 'SPACE+' statement
    {{ $$ = {type: "twice", body: $3}; }}
    | 'hello'
    {{ $$ = {type: "hello"}; }}
    | 'newline'
    {{ $$ = {type: "newline"}; }}
    ;
