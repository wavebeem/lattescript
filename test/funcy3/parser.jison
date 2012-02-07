%start program
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

expr: expr_08
    | expr_07
    | expr_06
    | expr_05
    | expr_04
    | expr_03
    | expr_02
    | expr_01
    ;

expr_01: expr or  expr_02 { $$ = {type: $2, left: $1, right: $3}; };
expr_02: expr and expr_03 { $$ = {type: $2, left: $1, right: $3}; };
expr_03: expr_04 exp expr { $$ = {type: $2, left: $1, right: $3}; };
expr_04: expr mul expr_05 { $$ = {type: $2, left: $1, right: $3}; }
       | expr div expr_05 { $$ = {type: $2, left: $1, right: $3}; };
expr_05: expr add expr_06 { $$ = {type: $2, left: $1, right: $3}; }
       | expr sub expr_06 { $$ = {type: $2, left: $1, right: $3}; };
expr_06: expr add expr_07 { $$ = {type: $2, left: $1, right: $3}; };
expr_07: expr at  expr_08 { $$ = {type: $2, left: $1, right: $3}; };
expr_08: len expr_08         { $$ = {type: "LEN", arg: $2}; }
       | lparen expr rparen  { $$ = $2; }
       | basic
       ;

basic: literal
     | id
     ;

list: lbracket list_internals rbracket { $$ = {type: "LIST", values: $list_internals}; };

list_internals: empty_list_internals
              | nonempty_list_internals
              ;

empty_list_internals: { $$ = []; };

nonempty_list_internals: nonempty_list_internals comma expr { $$.push($expr); }
                       | expr                               { $$ =   [$expr]; }
                       ;

literal: bool
       | num
       | str
       | list
       ;

bin_op: and
      | or
      | lt
      | gt
      | le
      | ge
      | eq
      | cat
      | add
      | sub
      | mul
      | div
      | exp
      ;

block_statement: while_statement;

bool: true
    | false
    ;

true:  'TRUE'  { $$ = {type: "BOOL", value: true }; };
false: 'FALSE' { $$ = {type: "BOOL", value: false}; };

id: 'ID' { $$ = {type: "ID", value: $1}; };

pass: 'PASS' { $$ = {type: "NOOP"}; };

num: 'NUM' { $$ = {type: "NUM", value: Number($1)}; };

at:  'AT'  { $$ = {type: "OP", value: "AT" }; };
eq:  'EQ'  { $$ = {type: "OP", value: "EQ" }; };
lt:  'LT'  { $$ = {type: "OP", value: "LT" }; };
gt:  'GT'  { $$ = {type: "OP", value: "GT" }; };
le:  'LE'  { $$ = {type: "OP", value: "LE" }; };
ge:  'GE'  { $$ = {type: "OP", value: "GE" }; };
or:  'OR'  { $$ = {type: "OP", value: "OR" }; };
or:  'AT'  { $$ = {type: "OP", value: "AT" }; };
and: 'AND' { $$ = {type: "OP", value: "AND"}; };
cat: 'CAT' { $$ = {type: "OP", value: "CAT"}; };
add: 'ADD' { $$ = {type: "OP", value: "ADD"}; };
sub: 'SUB' { $$ = {type: "OP", value: "SUB"}; };
mul: 'MUL' { $$ = {type: "OP", value: "MUL"}; };
div: 'DIV' { $$ = {type: "OP", value: "DIV"}; };
exp: 'EXP' { $$ = {type: "OP", value: "EXP"}; };

str: 'STR' { $$ = {type: "STR", value: $1}; };

len: 'LEN';
while: 'WHILE';
comma: 'COMMA';
newline: 'NEWLINE';
indent: 'INDENT';
dedent: 'DEDENT';
eof: 'EOF';
lparen: 'LPAREN';
rparen: 'RPAREN';
lbracket: 'LBRACKET';
rbracket: 'RBRACKET';

/* vim: set syn=yacc: */
%%
