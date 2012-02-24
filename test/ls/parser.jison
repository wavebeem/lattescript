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
: nonempty_id_list comma id { $$.push($id.value); }
| id                        { $$ =   [$id.value]; }
;

proc_def
: procedure id id_list newline
  maybe_with
  block
{ $$ = {
    type: "PROC_DEF",
    name: $id.value,
    args: $id_list,
    vars: $maybe_with,
    body: $block
}; }
;

func_def
: function id lparen id_list rparen newline
  maybe_with
  block
{ $$ = {
    type: "FUNC_DEF",
    name: $id.value,
    args: $id_list,
    vars: $maybe_with,
    body: $block
}; }
;

maybe_with
: with nonempty_id_list newline { $$ = $nonempty_id_list; }
| /* empty */                   { $$ = []; }
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
: for_helper by expr newline
  block
{ $$.by = $expr;
  $$.statements = $block;
}
| for_helper newline
  block
{ $$.by = {type: "NUM", value: 1};
  $$.statements = $block;
}
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
: if_helper else if_statement  { $$["else"] = $if_statement; }
| if_helper else newline block { $$["else"] = $block; }
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
| return_statement
| pass
| assignment
;

return_statement
: return expr
{ $$ = {type: "RETURN", value: $expr}; }
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
{ $$ = {type: "PROC_CALL", name: $id.value, args: $args_list}; }
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
: expr_01 at  expr_02 { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| expr_02
;

expr_02
: expr_02 cat expr_03 { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| expr_03
;

expr_03
: expr_03 lt  expr_04 { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| expr_03 gt  expr_04 { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| expr_03 le  expr_04 { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| expr_03 ge  expr_04 { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| expr_03 eq  expr_04 { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| expr_04
;

expr_04
: expr_04 add expr_05 { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| expr_04 sub expr_05 { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| expr_05
;

expr_05
: expr_05 mul expr_06 { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| expr_05 div expr_06 { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| expr_06
;

expr_06
: expr_07 exp expr_06 { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| expr_07
;

expr_07
: expr_07 and expr_08 { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| expr_08
;

expr_08
: expr_08 or  expr_09 { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
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
{ $$ = {type: "FUNC_CALL", name: $id.value, args: $args_list}; }
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
{ $$ = {type: "LIST", immutable: true, values: $list_internals}; }
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

at:  'AT'  { $$ = {type: "OP", op: "AT" }; };
eq:  'EQ'  { $$ = {type: "OP", op: "EQ" }; };
lt:  'LT'  { $$ = {type: "OP", op: "LT" }; };
gt:  'GT'  { $$ = {type: "OP", op: "GT" }; };
le:  'LE'  { $$ = {type: "OP", op: "LE" }; };
ge:  'GE'  { $$ = {type: "OP", op: "GE" }; };
or:  'OR'  { $$ = {type: "OP", op: "OR" }; };
and: 'AND' { $$ = {type: "OP", op: "AND"}; };
cat: 'CAT' { $$ = {type: "OP", op: "CAT"}; };
add: 'ADD' { $$ = {type: "OP", op: "ADD"}; };
sub: 'SUB' { $$ = {type: "OP", op: "SUB"}; };
mul: 'MUL' { $$ = {type: "OP", op: "MUL"}; };
div: 'DIV' { $$ = {type: "OP", op: "DIV"}; };
exp: 'EXP' { $$ = {type: "OP", op: "EXP"}; };

return: 'RETURN';

text: 'TEXT' { $$ = {type: "TEXT", value: $1}; };

assign: 'ASSIGN';

with: 'WITH';
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
