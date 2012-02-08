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
                | assignment
                ;

assignment: id assign expr { $$ = {type: "ASSIGN", left: $id, right: $expr}; };

proc_call: id args_list { $$ = {type: "PROC_CALL", name: $id, args: $args_list}; };

args_list: nonempty_args_list
         | empty_args_list
         ;

nonempty_args_list: nonempty_args_list comma expr { $$.push($expr); }
                  | expr                          { $$ =   [$expr]; }
                  ;

empty_args_list: { $$ = []; };

expr: expr_01;

expr_01: expr_01 or  expr_02 { $$ = {type: $2, left: $1, right: $3}; }
       | expr_02
       ;
expr_02: expr_02 and expr_03 { $$ = {type: $2, left: $1, right: $3}; }
       | expr_03
       ;
expr_03: expr_04 exp expr_03 { $$ = {type: $2, left: $1, right: $3}; }
       | expr_04
       ;
expr_04: expr_04 add expr_05 { $$ = {type: $2, left: $1, right: $3}; }
       | expr_04 sub expr_05 { $$ = {type: $2, left: $1, right: $3}; }
       | expr_05
       ;
expr_05: expr_05 mul expr_06 { $$ = {type: $2, left: $1, right: $3}; }
       | expr_05 div expr_06 { $$ = {type: $2, left: $1, right: $3}; }
       | expr_06
       ;
expr_06: expr_06 lt  expr_07 { $$ = {type: $2, left: $1, right: $3}; }
       | expr_06 gt  expr_07 { $$ = {type: $2, left: $1, right: $3}; }
       | expr_06 le  expr_07 { $$ = {type: $2, left: $1, right: $3}; }
       | expr_06 ge  expr_07 { $$ = {type: $2, left: $1, right: $3}; }
       | expr_06 eq  expr_07 { $$ = {type: $2, left: $1, right: $3}; }
       | expr_07
       ;
expr_07: expr_07 cat expr_08 { $$ = {type: $2, left: $1, right: $3}; }
       | expr_08
       ;
expr_08: expr_08 at  expr_09 { $$ = {type: $2, left: $1, right: $3}; }
       | expr_09
       ;
expr_09: len expr_10         { $$ = {type: "LEN", arg: $2}; }
       | sub expr_10         { $$ = {type: "NEG", arg: $2}; }
       | add expr_10         { $$ = {type: "POS", arg: $2}; }
       | expr_10
       ;
expr_10: lparen expr rparen  { $$ = $2; }
       | basic
       ;

basic: literal
     | id
     ;

literal: bool
       | num
       | text
       | list
       ;

list: lbracket list_internals rbracket { $$ = {type: "LIST", values: $list_internals}; };

list_internals: empty_list_internals
              | nonempty_list_internals
              ;

empty_list_internals: { $$ = []; };

nonempty_list_internals: nonempty_list_internals comma expr { $$.push($expr); }
                       | expr                               { $$ =   [$expr]; }
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
and: 'AND' { $$ = {type: "OP", value: "AND"}; };
cat: 'CAT' { $$ = {type: "OP", value: "CAT"}; };
add: 'ADD' { $$ = {type: "OP", value: "ADD"}; };
sub: 'SUB' { $$ = {type: "OP", value: "SUB"}; };
mul: 'MUL' { $$ = {type: "OP", value: "MUL"}; };
div: 'DIV' { $$ = {type: "OP", value: "DIV"}; };
exp: 'EXP' { $$ = {type: "OP", value: "EXP"}; };

text: 'TEXT' { $$ = {type: "TEXT", value: $1}; };

assign: 'ASSIGN';

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
