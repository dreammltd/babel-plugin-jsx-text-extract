/* eslint no-unused-vars:0 */
var counts={}, translations={};

function getRootContainerName(path){
    var parent = path.scope;
    while(parent && parent.parent){
        parent = parent.parent;
    }
    var keys = Object.keys(parent.bindings);

    return keys[keys.length-1];
}

function getUniqueName(name){
    if(counts[name])
        counts[name]++;
    else
        counts[name] = 1;
    return name + '-' + counts[name];
}

export default function ({types: t}) {
    return {
        visitor: {
            Program:{
                enter: function (path, state){
                },
                exit: function (path, state){
                    console.dir(translations);
                }
            },
            JSXText:{
                exit: function (path){
                    var contextName = path.parent.type;
                    if(path.parent.type === 'JSXElement'){
                        contextName = path.parent.openingElement.name.name
                    }

                    if(path.node.value.trim()=="")return;
                    contextName = getUniqueName(getRootContainerName(path)+'-'+(Object.keys(translations).length+1)+'-'+contextName);
                    translations[contextName] = path.node.value;

                    path.replaceWith(
                        t.JSXExpressionContainer(
                            t.callExpression(
                                t.identifier('getText'),
                                [t.stringLiteral(contextName)]
                            )
                        )
                    );


                }
            }
        }
    };
}
