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

nonempty_args_list: nonempty_args_list comma expr { $$.push($expr); }
                  | expr                          { $$ =   [$expr]; }
                  ;

empty_args_list: { $$ = []; };

expr: expr   bin_op expr   { $$ = {type: $bin_op, left: $expr1, right: $expr2}; }
    | lparen expr   rparen { $$ = $expr; }
    | literal
    | id
    ;

literal: bool
       | num
       | str
       ;

bin_op: and { $$ = "AND"; }
      | or  { $$ = "OR";  }
      | lt  { $$ = "LT";  }
      | gt  { $$ = "GT";  }
      | le  { $$ = "LE";  }
      | ge  { $$ = "GE";  }
      | eq  { $$ = "EQ";  }
      | cat { $$ = "CAT"; }
      | add { $$ = "ADD"; }
      | sub { $$ = "SUB"; }
      | mul { $$ = "MUL"; }
      | div { $$ = "DIV"; }
      | exp { $$ = "EXP"; }
      ;

block_statement: while_statement;

pass: 'PASS' { $$ = {type: "NOOP"}; };

bool: true   { $$ = {type: "BOOL", value: true }; }
    | false  { $$ = {type: "BOOL", value: false}; }
    ;

true:  'TRUE';
false: 'FALSE';
eq: 'EQ';
lt: 'LT';
gt: 'GT';
le: 'LE';
ge: 'GE';
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
