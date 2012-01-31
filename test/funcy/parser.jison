%lex
%%

\s+                     { };
"function"              { return 'FUNC'; };
"procedure"             { return 'PROC'; };
"end"                   { return 'END'; };
[a-z_]+                 { return 'ID'; };
<<EOF>>                 { return 'EOF'; };
.                       { return 'INVALID'; };

/lex

%start program

%%

program
    : sub_defs 'EOF'
    {{ return $sub_defs; }}
    ;

sub_defs
    : sub_defs sub_def
    {{ $$.sub_defs.push($sub_def); }}
    | sub_def
    {{ $$ = {type: "SUB_DEFS", sub_defs: [$sub_def]}; }}
    ;

sub_def
    : proc_def
    | func_def
    ;

proc_def
    : 'PROC' id block 'END'
    {{ $$ = {type: "PROC_DEF", name: $id, body: $block}; }}
    ;

func_def
    : 'FUNC' id block 'END'
    {{ $$ = {type: "FUNC_DEF", name: $id, body: $block}; }}
    ;

block
    : block statement
    {{ $$.statements.push($statement); }}
    | statement
    {{ $$ = {type: "BLOCK", statements: [$statement]}; }}
    ;

statement
    : id
    {{ $$ = {type: "PROC_CALL", name: $id}; }}
    ;

id: 'ID' {{ $$ = $1 }};
%%
