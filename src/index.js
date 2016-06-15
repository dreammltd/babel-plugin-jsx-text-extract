/* eslint no-unused-vars:0 */

var counts = {};

function getUniqueName(name) {
    if (counts[name])
        counts[name]++;
    else
        counts[name] = 1;
    return name + '-item' + counts[name];
}

export default function ({types: t}) {
    return {
        visitor: {
            Program: {
                enter: function (path, state) {
                    state.reactJsxText = {
                        strings: {}
                    };
                },
                exit: function (path, state) {
                    state.file.log.warn(state.reactJsxText.strings);
                }
            },
            JSXText: {
                exit: function (path, state) {
                    let {reactJsxText, file} = state;
                    let {strings} = reactJsxText;
                    const { filename} = file.opts;
                    var srcFileName = filename.substr(filename.indexOf('src') + 4)
                        .split('/').join('-')
                        .replace('.js','')
                        .toLowerCase();


                    var contextName = path.parent.type;
                    if (path.parent.type === 'JSXElement') {
                        contextName = path.parent.openingElement.name.name
                    }
                    if (path.node.value.trim() == "")
                        return;

                    contextName = getUniqueName(srcFileName) + '-' + contextName;
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
