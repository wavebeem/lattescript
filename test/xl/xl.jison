%lex
%%

\s+                   /* skip whitespace */
"twice"               return 'twice'
'['                   return '['
']'                   return ']'
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
    : 'twice' '[' statement ']'
    {{ $$ = {type: "twice", body: $3}; }}
    | 'hello'
    {{ $$ = {type: "hello"}; }}
    ;
