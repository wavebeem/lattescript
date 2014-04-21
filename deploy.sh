#!/bin/bash
rm -rf build
mkdir build
cp -r * build
s3cmd sync --acl-public --no-progress build/ s3://mockbrian.com/lattescript/
