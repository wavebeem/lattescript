#!/bin/bash

Escape-HTML() {
    sed \
        -e 's/</\&lt;/g' \
        -e 's/>/\&gt;/g'
}

for code in examples/*.latte; do
    name=$(basename "$code")
    text=$(Escape-HTML < "$code")
    echo "<h2>$name</h2>"
    echo "<pre>$text</pre>"
done
