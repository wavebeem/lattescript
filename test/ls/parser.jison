%start program
%%
program
: sub_defs eof
{ return $sub_defs; }
;

sub_defs
: sub_defs sub_def { $$.sub_defs.push($sub_def); }
| sub_def          { $$ = {type: "SUB_DEFS", sub_defs: [$sub_def]}; }
| newline          { $$ = {type: "SUB_DEFS", sub_defs: []}; }
;

sub_def
: proc_def
| func_def
;

id_list
: nonempty_id_list
| empty_id_list
;

empty_id_list
: /* empty */
{ $$ = []; }
;

nonempty_id_list
: nonempty_id_list id { $$.push($id); }
| id                  { $$ =   [$id]; }
;

proc_def
: procedure id id_list newline block
{ $$ = {type: "PROC_DEF", name: $id, args: $id_list, body: $block}; }
;

func_def
: function id lparen id_list rparen newline block
{ $$ = {type: "FUNC_DEF", name: $id, args: $id_list, body: $block}; }
;

block
: indent statements dedent
{ $$ = $statements; }
;

until_statement
: until expr newline block
{ $$ = {type: "UNTIL", condition: $expr, statements: $block}; }
;

while_statement
: while expr newline block
{ $$ = {type: "WHILE", condition: $expr, statements: $block}; }
;

forrange_statement
: for_helper by expr newline block { $$.by = $expr; $$.statements = $block; }
| for_helper         newline block { $$.by =     1; $$.statements = $block; }
;

for_helper
: for id from expr to expr
{ $$ = {type: "FORRANGE", from: $expr1, to: $expr2}; }
;

foreach_statement
: for id in expr newline block
{ $$ = {type: "FOREACH", var: $id, list: $expr, statements: $block}; }
;

if_statement
: if_helper else if_statement  { $$.else = $if_statement; }
| if_helper else newline block { $$.else = $block; }
| if_helper
;

if_helper
: if expr newline block
{ $$ = {type: "IF", cond: $expr, body: $block}; }
;

statements
: statements statement { $$.push($statement); }
| statement            { $$ =   [$statement]; }
;

block_statement
: while_statement
| until_statement
| forrange_statement
| foreach_statement
| if_statement
;

statement
: single_statement newline
| block_statement
| newline { $$ = {type: "NOOP"}; }
;

single_statement
: proc_call
| pass
| assignment
;

assignment
: lvalue assign expr
{ $$ = {type: "ASSIGN", left: $lvalue, right: $expr}; };

lvalue
: id
| list_lvalue
;

list_lvalue
: list_value at expr { $$ = {type: $at, left: $list_lvalue, right: $expr}; }
| id         at expr { $$ = {type: $at, left: $id,          right: $expr}; }
;

proc_call
: id args_list
{ $$ = {type: "PROC_CALL", name: $id, args: $args_list}; }
;

args_list
: nonempty_args_list
| empty_args_list
;

nonempty_args_list
: nonempty_args_list comma expr { $$.push($expr); }
| expr                          { $$ =   [$expr]; }
;

empty_args_list
: /* empty */
{ $$ = []; }
;

expr: expr_01;

expr_01
: expr_01 or  expr_02 { $$ = {type: $2, left: $1, right: $3}; }
| expr_02
;

expr_02
: expr_02 and expr_03 { $$ = {type: $2, left: $1, right: $3}; }
| expr_03
;

expr_03
: expr_04 exp expr_03 { $$ = {type: $2, left: $1, right: $3}; }
| expr_04
;

expr_04
: expr_04 add expr_05 { $$ = {type: $2, left: $1, right: $3}; }
| expr_04 sub expr_05 { $$ = {type: $2, left: $1, right: $3}; }
| expr_05
;

expr_05
: expr_05 mul expr_06 { $$ = {type: $2, left: $1, right: $3}; }
| expr_05 div expr_06 { $$ = {type: $2, left: $1, right: $3}; }
| expr_06
;

expr_06
: expr_06 lt  expr_07 { $$ = {type: $2, left: $1, right: $3}; }
| expr_06 gt  expr_07 { $$ = {type: $2, left: $1, right: $3}; }
| expr_06 le  expr_07 { $$ = {type: $2, left: $1, right: $3}; }
| expr_06 ge  expr_07 { $$ = {type: $2, left: $1, right: $3}; }
| expr_06 eq  expr_07 { $$ = {type: $2, left: $1, right: $3}; }
| expr_07
;

expr_07
: expr_07 cat expr_08 { $$ = {type: $2, left: $1, right: $3}; }
| expr_08
;

expr_08
: expr_08 at  expr_09 { $$ = {type: $2, left: $1, right: $3}; }
| expr_09
;

expr_09
: len expr_10 { $$ = {type: "LEN", arg: $2}; }
| sub expr_10 { $$ = {type: "NEG", arg: $2}; }
| add expr_10 { $$ = {type: "POS", arg: $2}; }
| expr_10
;

expr_10
: lparen expr rparen  { $$ = $2; }
| func_call
| basic
;

func_call
: id lparen args_list rparen
{ $$ = {type: "FUNC_CALL", args: $args_list}; }
;

basic
: literal
| id
;

literal
: bool
| num
| text
| list
| nothing
;

list
: lbracket list_internals rbracket
{ $$ = {type: "LIST", values: $list_internals}; }
;

list_internals
: empty_list_internals
| nonempty_list_internals
;

empty_list_internals
: /* empty */
{ $$ = []; }
;

nonempty_list_internals
: nonempty_list_internals comma expr { $$.push($expr); }
| expr                               { $$ =   [$expr]; }
;

bool
: true
| false
;

true:  'TRUE'  { $$ = {type: "BOOL", value: true }; };
false: 'FALSE' { $$ = {type: "BOOL", value: false}; };

nothing: 'NOTHING' { $$ = {type: "NOTHING"}; };

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

from: 'FROM';
by: 'BY';
in: 'IN';
to: 'TO';
if: 'IF';
else: 'ELSE';

for: 'FOR';
len: 'LEN';
until: 'UNTIL';
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

function: 'FUNCTION';
procedure: 'PROCEDURE';

/* vim: set syn=yacc: */
%%
