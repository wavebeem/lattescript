%left add
%left mul
%%
program: statements eof
    { return {type: "BLOCK", statements: $statements}; };

block: indent statements dedent
    { $$ = $statements; };

while_statement: while newline block
    { $$ = {type: "WHILE", statements: $block}; };

statements: statements statement { $$.push($statement); }
          | statement            { $$ =   [$statement]; }
          ;

statement: single_statement newline
         | block_statement
         ;

single_statement: proc_call;

proc_call: id args_list { $$ = {type: "PROC_CALL", name: $id, args: $args_list}; };

args_list: nonempty_args_list
         | empty_args_list
         ;

nonempty_args_list: nonempty_args_list comma arg { $$.push($arg); }
                  | arg                          { $$ =   [$arg]; }
                  ;

empty_args_list: { $$ = []; };

expr: expr add expr { $$ = {type: "ADD", left: $expr1, right: $expr2}; }
    | expr mul expr { $$ = {type: "MUL", left: $expr1, right: $expr2}; }
    | num
    | id
    ;

block_statement: while_statement;

arg: expr;
id: 'ID';
num: 'NUM';
while: 'WHILE';
comma: 'COMMA';
newline: 'NEWLINE';
indent: 'INDENT';
dedent: 'DEDENT';
eof: 'EOF';
add: 'ADD';
mul: 'MUL';
/* vim: set syn=yacc: */
%%
