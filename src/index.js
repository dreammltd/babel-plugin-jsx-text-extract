/* eslint no-unused-vars:0 */
import fs from 'fs';
import * as path from 'path';
import _ from 'lodash';

const exportFilename = 'dist/__text.js',
    settingsFilename = 'dreamm-babel-settings.json',
    exportPrefix = 'var __textItems = ';

var counts = {};

function getUniqueName(name) {
    if (counts[name])
        counts[name]++;
    else
        counts[name] = 1;
    return name + '-item' + counts[name];
}

var relativePath = function (filename) {
    return path.join(
        process.cwd(), filename
    );
};

const exportFilePath = relativePath(exportFilename);
const settingsFilePath = relativePath(settingsFilename);

const MODE_INSERT = 'insert';
const MODE_EXTRACT = 'extract';

export default function ({types: t}) {
    return {
        visitor: {
            Program: {
                enter: function (path, state) {
                    let loadedStrings = {}, settings = {
                        mode: MODE_EXTRACT/*
                         mode: MODE_INSERT,
                         textItems: {
                         "content-m1-01-01-item6-subheading": "This text was updated automatically",
                         "content-m1-01-01-item7-instruction": "Tap the forward arrow to begin your learning journey."
                         }*/
                    };

                    // load existings strings if present
                    if (fs.existsSync(exportFilePath)) {
                        loadedStrings = JSON.parse(String(fs.readFileSync(exportFilePath)).replace(exportPrefix, ''));
                    }

                    if (fs.existsSync(settingsFilePath)) {
                        settings = JSON.parse(String(fs.readFileSync(settingsFilePath)));
                    }

                    state.settings = settings;
                    state.changed = false;
                    state.reactJsxText = {
                        strings: loadedStrings
                    };
                },
                exit: function (path, state) {
                    // todo: save out the updated version of this source file if it changed
                    if (state.changed) {

                    }
                    fs.writeFileSync(exportFilePath, exportPrefix + JSON.stringify(state.reactJsxText.strings, null, "\t"));
                }
            },
            JSXText: {
                exit: function (path, state) {
                    let {reactJsxText, file, settings} = state;
                    let {strings} = reactJsxText;
                    const {filename} = file.opts;

                    console.log('-------------');
                    console.log('-------------');
                    console.log('-------------');
                    console.dir(file);
                    console.dir(file.opts);
                    console.log('-------------');
                    console.log('-------------');
                    console.log('-------------');
                    const srcFileName = filename.substr(filename.indexOf('src') + 4)
                        .split('/').join('-')
                        .replace('.js', '')
                        .toLowerCase();

                    let key = path.parent.type;
                    if (path.parent.type === 'JSXElement') {
                        key = path.parent.openingElement.name.name
                    }
                    if (path.node.value.trim() == "")
                        return;

                    key = getUniqueName(srcFileName) + '-' + key.toLowerCase();
                    strings[key] = path.node.value;

                    // check mode
                    if (settings.mode === MODE_EXTRACT) {
                        path.replaceWith(
                            t.JSXExpressionContainer(
                                t.callExpression(
                                    t.identifier('__text'),
                                    [t.stringLiteral(key)]
                                )
                            )
                        );
                    }

                    if (settings.mode === MODE_INSERT) {
                        if(!settings.textItems){
                            return;
                        }

                        // check if this key exists in the textItems
                        if(!_.isUndefined(settings.textItems[key])) {
                            // key exists
                            state.changed = true;
                            // replace with our text
                            path.replaceWith(
                                t.JSXText(settings.textItems[key])
                            );
                        }
                    }

                }
            }
        }
    };
}
