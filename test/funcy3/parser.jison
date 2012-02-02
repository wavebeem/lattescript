%%
program
    : statements eof
    {{ return $block; }}
    ;

while_statement
    : while newline block
    {{ $$ = {type: "WHILE", statements: $block}; }}
    ;

block
    : indent statements dedent
    {{ $$ = $statements; }}
    ;

statements
    : statements newline statement
    {{ $$.push($statement); }}
    | statement
    {{ $$ = [$statement]; }}
    |
    {{ $$ = []; }}
    ;

statement
    : id
    | while_statement
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
