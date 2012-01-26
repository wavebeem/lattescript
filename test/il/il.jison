%lex
%%

\s+                   /* skip whitespace */
"twice"               return 'twice'
'  '                  return 'indent'
'hello'               return 'hello'
<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex

%start program

%%

program
    : statement EOF
    {{ return $1; }}
    ;

statement
    : 'indent' statement
    | 'twice' statement
    {{ $$ = {type: "twice", body: $2}; }}
    | 'hello'
    {{ $$ = {type: "hello"}; }}
    ;
