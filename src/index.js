/* eslint no-unused-vars:0 */
import fs from 'fs';
import * as p from 'path';

const exportFileName = 'dist/__text.js',
    exportPrefix = 'var __textItems = ';

var counts = {};

function getUniqueName(name) {
    if (counts[name])
        counts[name]++;
    else
        counts[name] = 1;
    return name + '-item' + counts[name];
}

let exportFilePath = p.join(
    process.cwd(), exportFileName
);

export default function ({types: t}) {
    return {
        visitor: {
            Program: {
                enter: function (path, state) {
                    let loadedStrings = {};
                    // load existings strings if present
                    if (fs.existsSync(exportFilePath)) {
                        loadedStrings = JSON.parse(String(fs.readFileSync(exportFilePath)).replace(exportPrefix, ''));
                    }

                    state.reactJsxText = {
                        strings: loadedStrings
                    };
                },
                exit: function (path, state) {
                    fs.writeFileSync(exportFilePath, exportPrefix + JSON.stringify(state.reactJsxText.strings, null, "\t"));
                }
            },
            JSXText: {
                exit: function (path, state) {
                    let {reactJsxText, file} = state;
                    let {strings} = reactJsxText;
                    const {filename} = file.opts;
                    var srcFileName = filename.substr(filename.indexOf('src') + 4)
                        .split('/').join('-')
                        .replace('.js', '')
                        .toLowerCase();

                    var contextName = path.parent.type;
                    if (path.parent.type === 'JSXElement') {
                        contextName = path.parent.openingElement.name.name
                    }
                    if (path.node.value.trim() == "")
                        return;

                    contextName = getUniqueName(srcFileName) + '-' + contextName.toLowerCase();
                    strings[contextName] = path.node.value;

                    path.replaceWith(
                        t.JSXExpressionContainer(
                            t.callExpression(
                                t.identifier('__text'),
                                [t.stringLiteral(contextName)]
                            )
                        )
                    );

                }
            }
        }
    };
}
