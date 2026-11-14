#!/bin/sh
# Builds index.html from src/ (needs Node + @babel/core @babel/cli @babel/preset-env in $BABEL_DIR).
# BABEL_DIR must contain babel.config.json: {"presets":[["@babel/preset-env",{"targets":{"ios":"9"}}]]}
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
BABEL_DIR="${BABEL_DIR:?set BABEL_DIR to a folder with @babel installed}"
cd "$BABEL_DIR"
node_modules/.bin/babel "$HERE/src/app.js" --config-file ./babel.config.json --no-babelrc -o app.es5.js
node_modules/.bin/acorn --ecma5 app.es5.js > /dev/null
python3 - "$HERE" <<'PY'
import sys
here=sys.argv[1]
t=open(here+"/src/template.html",encoding="utf-8").read()
js=open("app.es5.js",encoding="utf-8").read()
open(here+"/index.html","w",encoding="utf-8").write(t.replace("/*APP*/",js.replace("</script>","<\\/script>")))
print("built index.html")
PY
