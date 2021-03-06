////////////
// Pemdas Code
///////////

function solveThis(numsString) {
  return solveStr(reformat(numsString));
}

function replaceAll(haystack, needle, replace) {
    return haystack.split(needle).join(replace);
} // replace all fx

function reformat(s) {
    s = s.toLowerCase();
    s = replaceAll(s, "-(", "-1*(");
    s = replaceAll(s, ")(", ")*(");
    s = replaceAll(s, " ", "");
    s = replaceAll(s, "-", "+-");
    s = replaceAll(s, "--", "+");
    s = replaceAll(s, "++", "+");
    s = replaceAll(s, "(+", "(");
    for (var i = 0; i < 10; i++) {
        s = replaceAll(s, i + "(", i + "*" + "(");
    }
    while(s.charAt(0) == "+") s = s.substr(1);
    console.log(s);
    return s;
} // standardize string format

function strContain(haystack, needle) {
    return haystack.indexOf(needle) > -1;
} // custom true/false contains

function isParseable(n, minus) {
    return (!isNaN(n) || (n == "-" && !minus) || n == ".");
} // determine if char should be added to side

function getSide(haystack, middle, direction, minus) {
    var i = middle + direction;
    var term = "";
    var limit = (direction == -1) ? 0 : haystack.length; // set the stopping point, when you have gone too far
    while (i * direction <= limit) { // while the current position is >= 0, or <= upper limit
        if (isParseable(haystack[i], minus)) {
            if (direction == 1) term = term + haystack[i];
            else term = haystack[i] + term;
            i += direction;
        } else { return term; }
    }
    return term;
} // general fx to get two terms of any fx (multiply, add, etc)

function allocFx(eq, symbol, alloc, minus) {
    minus = (typeof minus !== 'undefined'); // sometimes we want to capture minus signs, sometimes not
    if (strContain(eq, symbol)) {
        var middleIndex = eq.indexOf(symbol);
        var left = getSide(eq, middleIndex, -1, minus);
        var right = getSide(eq, middleIndex, 1, false);
        eq = replaceAll(eq, left+symbol+right, alloc(left, right));
    }
    return eq;
} // fx to generically map a symbol to a function for parsing

function solveStr(eq) {
    firstNest:
    while (strContain(eq, "(")) { // while the string has any parentheses
        var first = eq.indexOf("("); // first get the earliest open parentheses
        var last = first + 1; // start searching at the character after
        var layer = 1; // we might run into more parentheses, so this integer will keep track
        while (layer != 0) { // loop this until we've found the close parenthesis
            if (eq[last] == ")") { // if we run into a close parenthesis, then subtract one from "layer"
                layer--;
                if (layer == 0) break; // if it is the corresponding closing parenthesis for our outermost open parenthesis, then we can deal with this expression
            }
            else if (eq[last] == "(") { // if we see an open parenthesis, add one to "layer"
                layer++;
            }
            last++; // increment the character we're looking at
            if (last > eq.length) break firstNest;
        }

        var nested = eq.substr(first + 1, last - first - 1); // get the expression between the parentheses

        if (last + 1 <= eq.length) { // if there is exponentiation, change to a different symbol
            if (eq[last + 1] == "^") {
                eq = eq.substr(0, last + 1) + "&" + eq.substr((last+1)+1);
            }
        }

        var solvedStr = solveStr(nested);
        var preStr = "(" + nested + ")";
        eq = eq.replace(preStr, solvedStr); // replace parenthetical with value
    }
    while (strContain(eq, "^")) eq = allocFx(eq, "^", function(l, r) { return Math.pow(parseFloat(l),parseFloat(r)); }, false);
    while (strContain(eq, "&")) eq = allocFx(eq, "&", function(l, r) { return Math.pow(parseFloat(l),parseFloat(r)); }); // account for things like (-3)^2
    while (strContain(eq, "*") || strContain(eq, "/")) {
        var multiply = true;
        if (eq.indexOf("*") < eq.indexOf("/")) {
            multiply = (strContain(eq, "*"));
        } else {
            multiply = !(strContain(eq, "/"));
        }
        eq = (multiply) ? allocFx(eq, "*", function(l, r) { return parseFloat(l)*parseFloat(r); }) : allocFx(eq, "/", function(l, r) { return parseFloat(l)/parseFloat(r); });
    }
    while (strContain(eq, "+")) eq = allocFx(eq, "+", function(l, r) { return parseFloat(l)+parseFloat(r); });
    return eq;
} // main recursive fx + PEMDAS


/////////////
// URL parameter
/////////////////
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
/////////////////
// BOt Code
//////////////
$(document).ready(function() {
  var answerField = $('input[name^="bot_answer"]')

    if( $('.square-matrix').length > 0)  {
        console.log('square-matrix', $('.square-matrix b').first().text());

        if ( !$('.square-matrix b').first().text() ) {
          answerField.val($('.square-matrix b').length);
        } else {

            var sum = 0;
            var bs = $('.square-matrix b');

            for (i=0;i<bs.length;i++)  {
                sum += parseInt($(bs[i]).text());
            }
            console.log('is sum one', bs.length, sum);
            answerField.val(sum);
        }
    } else {
        var expr = $.trim($('.bot-question').text().substring(7).split("?")[0]);
        expr = expr.replace('X', '*').replace('x', '*');
        console.log("Expression", expr);
        var answer = solveThis(expr);
        console.log("Answer is", answer);
        answerField.val(answer);
    }
});
