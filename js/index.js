const mathjs = window.math;

const display = document.querySelector('#display');
const buttons = document.querySelector('#buttons');
const operator = /[+\-*/]/;


let currNum = '0';
let prevBtn = '';

console.log(mathjs.evaluate("5%"));

buttons.addEventListener('click', (e) => {
    const target = e.target;
    const value = target.dataset.value;

    const digit = /^\d$/;

    if (digit.test(value)) processNum(target);
    if (operator.test(value)) processOp(target);
    if (value === '=') processEq(target);
    if (value === '%') processMod(target);

    display.textContent = display.dataset.value;
    console.log(`curr: ${currNum}`, `dis: ${display.dataset.value}`);
})


/* 
STEP 1: Concatenate target value to currNum
STEP 2: Set display value to target value if display value equals 0, otherwise appends target value to display value

* needs to replace 0 with positive int if 0 is the currNum after operator
*/
function processNum(target) {
    const value = target.dataset.value;

    if (prevBtn === '=') {
        display.dataset.value = '';
        currNum = '0';
    }
    currNum = (currNum === '0') ? value : (currNum + value);
    display.dataset.value = (display.dataset.value === '0') ? value : (display.dataset.value + value);
}

function processOp(target) {
    const value = target.dataset.value;
    const addSub = /[+\-]/;
    
    switch (value) {
        case '-':
            if (addSub.test(display.dataset.value.at(-1))) {
                display.dataset.value = display.dataset.value.slice(0, -1) + value;
            } else if (display.dataset.value === '0') {
                display.dataset.value = value;
            } else {
                display.dataset.value += value;
            }
            break;

        case '+':
        case '*':
        case '/':
            if (display.dataset.value.at(-1) === '-' && operator.test(display.dataset.value.at(-2))) {
                display.dataset.value = display.dataset.value.slice(0, -2) + value;
            } else if (operator.test(display.dataset.value.at(-1))) {
                display.dataset.value = display.dataset.value.slice(0, -1) + value;
            } else {
                display.dataset.value += value;
            }
            break;

    }
    currNum = '';
}

function processEq(target) {
    display.dataset.value = currNum = mathjs.evaluate(display.dataset.value);
    prevBtn = target.dataset.value;
}

function processMod(target) {
    const value = target.dataset.value;

    if (operator.test(display.dataset.value.at(-1))) {
        if (display.dataset.value.at(-2) === '%') {
            display.dataset.value = display.dataset.value.slice(0, -1);
            return;
        }
        display.dataset.value = display.dataset.value.slice(0, -1) + value;

    } else if (display.dataset.value.at(-1) === '%') {
        if (currNum === '') {
            const lastOpIndex = lastRegexIndex(display.dataset.value, operator);
            console.log(lastOpIndex);
            currNum = display.dataset.value.slice(lastOpIndex, -1) + '%';
        }
        currNum = `(${currNum})%`;
        display.dataset.value = display.dataset.value.slice(0, -(currNum.length - 3)) + currNum;

    } else {
        currNum += '%';
        display.dataset.value += '%';
    }
}

function lastRegexIndex(str, regex) {
    const gRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
    const matches = [...str.matchAll(gRegex)];
    console.log(matches);
    return matches.length ? matches.at(-2).index : 0;
}