define(function (require, exports, module) {
    "use strict";

    function rangeFinder(cm, start) {
        // find ranges that can be folded -- sections (settings, varibles,
        // etc), keyword definitions and test case definitions

        // FIXME: stop at the last non-blank line of a block rather than the first
        // line of the next block
        var startLine = cm.getLine(start.line);
        var endPattern = null;
        var state = cm.getStateAfter(start.line);

        var heading_pattern = /^\s*\*+\s*(settings?|metadata|variables?|test( cases?)?|(user )?keywords?)[ *]*$/i;
        var first_cell_pattern = /^\|\s+[^|\s]/i;

        if (startLine.match(heading_pattern)) {
            // Found a heading? Everything up to the next heading or EOF
            // is foldable region
            endPattern = heading_pattern;

        } else if ((state.table_name === "test_cases" ||
                    state.table_name === "keywords") &&
                   startLine.match(first_cell_pattern)) {
            // The beginning of a test case or keyword? Fold up to
            // the next test case, keyword, or heading (though,
            // we actually go to a line that is _probably_ a heading
            // to keep the pattern short)
            endPattern = new RegExp(/^\|\s+[^\|]|^\s*\*+/);

        } else {
            // the current line is not a valid fold point...
            return false;
        }

        for (var i = start.line + 1, end = cm.lineCount(); i < end; ++i) {
            var curLine = cm.getLine(i);
            if (curLine.match(endPattern)) {
                var result={
                    from: {line: start.line, ch: startLine.length},
                    to: {line: i-1, ch: curLine.length}
                };
                return result;
            };
        };
        // if we fell through the loop, fold to the end of the file
        return {from: {line: start.line, ch: startLine.length},
                to: {line: i, ch: curLine.length}}
    }


    exports.rangeFinder = rangeFinder;

})


