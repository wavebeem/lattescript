%left  cat
%left  add sub
%left  mul div
%right exp
%left  and
%left  or

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
         | newline { $$ = {type: "NOOP"}; }
         ;

single_statement: proc_call
                | pass
                ;

proc_call: id args_list { $$ = {type: "PROC_CALL", name: $id, args: $args_list}; };

args_list: nonempty_args_list
         | empty_args_list
         ;

nonempty_args_list: nonempty_args_list comma arg { $$.push($arg); }
                  | arg                          { $$ =   [$arg]; }
                  ;

empty_args_list: { $$ = []; };

expr: expr   bin_op expr   { $$ = {type: $bin_op, left: $expr1, right: $expr2}; }
    | lparen expr   rparen { $$ = $expr; }
    | bool
    | num
    | str
    | id
    ;

bin_op: and
      | or
      | cat
      | add
      | sub
      | mul
      | div
      | exp
      ;

block_statement: while_statement;

pass: 'PASS' { $$ = {type: "NOOP"}; };

bool: true
    | false
    ;

true:  'TRUE'  { $$ = {type: "BOOL", value: true }; };
false: 'FALSE' { $$ = {type: "BOOL", value: false}; };

arg: expr;
id: 'ID';
num: 'NUM';
str: 'STR';
while: 'WHILE';
comma: 'COMMA';
newline: 'NEWLINE';
indent: 'INDENT';
dedent: 'DEDENT';
eof: 'EOF';
and: 'AND';
or:  'OR';
cat: 'CAT';
add: 'ADD';
sub: 'SUB';
mul: 'MUL';
div: 'DIV';
exp: 'EXP';
lparen: 'LPAREN';
rparen: 'RPAREN';

/* vim: set syn=yacc: */
%%
