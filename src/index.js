/* eslint no-unused-vars:0 */

var counts = {};

function getRootContainerName(path) {
    var parent = path.scope;
    while (parent && parent.parent) {
        parent = parent.parent;
    }
    var keys = Object.keys(parent.bindings);

    return keys[keys.length - 1];
}

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
                    console.dir(state.reactJsxText.strings);
                }
            },
            JSXText: {
                exit: function (path, state) {
                    let {reactJsxText, file} = state;
                    let {strings} = reactJsxText;
                    const {basename, filename} = file.opts;


                    file.log.warn('testing');
                    file.log.warn(filename);

                    console.log(filename);
                    var contextName = path.parent.type;
                    if (path.parent.type === 'JSXElement') {
                        contextName = path.parent.openingElement.name.name
                    }

                    if (path.node.value.trim() == "")
                        return;
                    contextName = getUniqueName(getRootContainerName(filename)) + '-' + contextName;
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
