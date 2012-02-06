%left  add sub
%left  mul div
%right exp

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
         | newline
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

expr: expr bin_op expr   { $$ = {type: $bin_op, left: $expr1, right: $expr2}; }
    | lparen expr rparen { $$ = $expr; }
    | num
    | id
    ;

bin_op: add
      | sub
      | mul
      | div
      | exp
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
sub: 'SUB';
mul: 'MUL';
div: 'DIV';
exp: 'EXP';
lparen: 'LPAREN';
rparen: 'RPAREN';

/* vim: set syn=yacc: */
%%
