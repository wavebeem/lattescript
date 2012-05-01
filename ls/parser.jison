%start program
%%
program
: top_levels eof
{ return $top_levels; }
;

top_levels
: nonempty_top_levels
{ $$.type = "AST"; }
| /* empty */
{ $$ = {type: "AST", statements: [], sub_defs: []}; }
;

nonempty_top_levels
: nonempty_top_levels sub_def
{ $$.sub_defs.push($sub_def); }
| nonempty_top_levels statement
{ $$.statements.push($statement); }
| sub_def
{ $$ = {statements: [], sub_defs: [$sub_def]}; }
| statement
{ $$ = {statements: [$statement], sub_defs: []}; }
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
  block
{ $$ = {
    type: "PROC_DEF",
    name: $id.value,
    args: $id_list,
    body: $block
}; }
;

func_def
: function id lparen id_list rparen newline
  block
{ $$ = {
    type: "FUNC_DEF",
    name: $id.value,
    args: $id_list,
    body: $block
}; }
;

block
: indent statements dedent
{ $$ = $statements; }
;

until_statement
: until expr newline block
{ $$ = {
    type: "UNTIL",
    condition: $expr,
    statements: $block};
}
;

while_statement
: while expr newline block
{ $$ = {
    type: "WHILE",
    condition: $expr,
    statements: $block,
    lineno: @$.first_line};
}
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
{ $$ = {
    type: "FOR_RANGE",
    "var": $id,
    from: $expr1,
    to: $expr2,
    lineno: @$.first_line};
}
;

foreach_statement
: for id in expr newline block
{ $$ = {
    type: "FOR_EACH",
    "var": $id,
    list: $expr,
    statements: $block,
    lineno: @$.first_line};
}
;

if_statement
: if_helper else if_statement  { $$["else"] = $if_statement; }
| if_helper else newline block { $$["else"] = {type: "BLOCK", body: $block}; }
| if_helper
;

if_helper
: if expr newline block
{ $$ = {type: "IF", condition: $expr, body: $block, lineno: @$.first_line}; }
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
{ $$ = $1; $$.lineno = @$.first_line; }
| block_statement
{ $$ = $1; $$.lineno = @$.first_line; }
| newline
{ $$ = {type: "NOOP", lineno: @$.first_line }; }
;

single_statement
: proc_call
| return_statement
| pass
| assignment
| list_set
;

return_statement
: return expr
{ $$ = {type: "RETURN", value: $expr}; }
| return
{ $$ = {type: "RETURN"}; }
;

assignment
: id assign expr
{ $$ = {type: "ASSIGN", left: $id, right: $expr}; };

list_set
: id at_list assign expr
{
    $$ = $id;
    for (var i = 0; i < $at_list.length - 1; i++) {
        $$ = {type: "OP", op: "AT", left: $$, right: $at_list[i]};
    }

    $$ = {type: "SET", left: $$, at: $at_list[$at_list.length - 1], right: $expr};
}
;

at_list
: at_list at prefix_expr { $$.push($prefix_expr); }
|         at prefix_expr { $$ =   [$prefix_expr]; }
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

expr
: cat_expr
;

cat_expr
: cat_expr cat and_expr { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| and_expr
;

and_expr
: and_expr and or_expr { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| or_expr
;

or_expr
: or_expr or cmp_expr { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| cmp_expr
;

cmp_expr
: cmp_expr lt add_expr { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| cmp_expr gt add_expr { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| cmp_expr le add_expr { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| cmp_expr ge add_expr { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| cmp_expr eq add_expr { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| add_expr
;

add_expr
: add_expr add mul_expr { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| add_expr sub mul_expr { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| mul_expr
;

mul_expr
: mul_expr mul  exp_expr { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| mul_expr div  exp_expr { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| mul_expr mod  exp_expr { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| mul_expr idiv exp_expr { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| exp_expr
;

exp_expr
: exp_expr exp at_expr { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| at_expr
;

at_expr
: at_expr at prefix_expr { $$ = {type: $2.type, op: $2.op, left: $1, right: $3}; }
| prefix_expr
;

prefix_expr
: len simple_expr { $$ = {type: "LEN", arg: $2}; }
| sub simple_expr { $$ = {type: "NEG", arg: $2}; }
| add simple_expr { $$ = {type: "POS", arg: $2}; }
| func_call
| simple_expr
;

simple_expr
: lparen expr rparen  { $$ = $2; }
| basic
;

func_call
: id lparen args_list rparen
{ $$ = {type: "FUNC_CALL", name: $id.value, args: $args_list}; }
;

basic
: literal
| read
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

at:   'AT'   { $$ = {type: "OP", op: "AT"  }; };
eq:   'EQ'   { $$ = {type: "OP", op: "EQ"  }; };
lt:   'LT'   { $$ = {type: "OP", op: "LT"  }; };
gt:   'GT'   { $$ = {type: "OP", op: "GT"  }; };
le:   'LE'   { $$ = {type: "OP", op: "LE"  }; };
ge:   'GE'   { $$ = {type: "OP", op: "GE"  }; };
or:   'OR'   { $$ = {type: "OP", op: "OR"  }; };
and:  'AND'  { $$ = {type: "OP", op: "AND" }; };
cat:  'CAT'  { $$ = {type: "OP", op: "CAT" }; };
add:  'ADD'  { $$ = {type: "OP", op: "ADD" }; };
sub:  'SUB'  { $$ = {type: "OP", op: "SUB" }; };
mul:  'MUL'  { $$ = {type: "OP", op: "MUL" }; };
div:  'DIV'  { $$ = {type: "OP", op: "DIV" }; };
exp:  'EXP'  { $$ = {type: "OP", op: "EXP" }; };
idiv: 'IDIV' { $$ = {type: "OP", op: "IDIV"}; };
mod:  'MOD'  { $$ = {type: "OP", op: "MOD" }; };

return: 'RETURN';

text: 'TEXT' { $$ = {type: "TEXT", value: $1}; };
read: 'READ' { $$ = {type: "READ"}; };

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
