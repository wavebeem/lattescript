%%
program
    : statements eof
    {{ return $block; }}
    ;

block
    : indent statements dedent
    {{ $$ = $statements; }}
    ;

while_statement
    : while newline block
    {{ $$ = {type: "WHILE", statements: $block}; }}
    ;

statements
    : statements statement
    {{ $$.push($statement); }}
    | statement
    {{ $$ = [$statement]; }}
    ;

statement
    : single_statement newline
    | block_statement
    ;

single_statement
    : id
    ;

block_statement
    : while_statement
    ;

while
    : 'WHILE'
    ;

id
    : 'ID'
    {{ $$ = $1; }}
    ;

newline
    : 'NEWLINE'
    ;

indent
    : 'INDENT'
    ;

dedent
    : 'DEDENT'
    ;

eof
    : 'EOF'
    ;
/* vim: set syn=yacc: */
%%
