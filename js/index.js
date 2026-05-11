const mathjs = window.math;

const display = document.querySelector('#display');
const buttons = document.querySelector('#buttons');
const clear = document.querySelector('#clear');
const digit = /\d/;
const operator = /[+\-*/]/;


let currNum = '0';
let prevBtn = '';

console.log(`curr: ${currNum}`, `dis: ${display.dataset.value}`, `prev: ${prevBtn}`);

buttons.addEventListener('click', (e) => {
    const target = e.target;
    const value = target.dataset.value;

    if (digit.test(value)) processNum(target);
    if (operator.test(value)) processOp(target);
    if (value === '=') processEq(target);
    if (value === '%') processMod(target);
    if (value === '.') processDec(target);
    if (value === 'delete') processDelete();
    if (value === 'clear') processClear();
    if (value === 'sign') processSign();

    display.textContent = display.dataset.value;
    console.log(`curr: ${currNum}`, `dis: ${display.dataset.value}`, `prev: ${prevBtn}`);
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
    if (display.dataset.value.at(-1) === '%') {
        currNum = '0';
    }
    if (display.dataset.value.at(-1) === ')') {
        display.dataset.value += '*';
    }
    currNum = (currNum === '0') ? value : (currNum + value);
    display.dataset.value = (display.dataset.value === '0') ? value : (display.dataset.value + value);
    prevBtn = value;
    clear.textContent = 'C';
}

function processOp(target) {
    const value = target.dataset.value;
    const addSub = /[+\-]/;
    
    switch (value) {
        case '-':
            currNum = (currNum === '0' && display.dataset.value === '0') ? value : '';
            
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
            if (display.dataset.value.at(-1) === '(') {
                return;
            }
            
            if (display.dataset.value.at(-1) === '-' && operator.test(display.dataset.value.at(-2))) {
                display.dataset.value = display.dataset.value.slice(0, -2) + value;
            } else if (operator.test(display.dataset.value.at(-1))) {
                display.dataset.value = display.dataset.value.slice(0, -1) + value;
            } else {
                display.dataset.value += value;
            }
            currNum = '';
            break;

    }
    prevBtn = value;
    clear.textContent = 'C';
}

function processEq(target) {
    if (operator.test(display.dataset.value.at(-1)) || display.dataset.value.at(-1) === '(') {
        return;
    }
    const result = mathjs.evaluate(display.dataset.value);
    currNum = parseFloat(result.toFixed(10)).toString();
    display.dataset.value = (currNum === 'Infinity') ? "Undefined" : currNum;
    prevBtn = target.dataset.value;
    clear.textContent = 'AC';
}

function processMod(target) {
    const value = target.dataset.value;

    if (display.dataset.value.at(-1) === '(') {
        return;
    }

    if (operator.test(display.dataset.value.at(-1))) {
        if (display.dataset.value.at(-2) === '%') {
            display.dataset.value = display.dataset.value.slice(0, -1);
            const opIndex = lastRegIndex(display.dataset.value, operator);
            currNum = display.dataset.value.slice(opIndex + 1, -1) + '%';
            return;
        }
        display.dataset.value = display.dataset.value.slice(0, -1) + value;
        const opIndex = lastRegIndex(display.dataset.value, operator);
        currNum = display.dataset.value.slice(opIndex + 1, -1) + '%';

    } else if (display.dataset.value.at(-1) === '%') {
        if (currNum === '') {
            const opIndex = lastRegIndex(display.dataset.value, operator);
            currNum = display.dataset.value.slice(opIndex + 1, -1) + '%';
        }
        currNum = `(${currNum})%`;
        display.dataset.value = display.dataset.value.slice(0, -(currNum.length - 3)) + currNum;

    } else {
        currNum += '%';
        display.dataset.value += '%';
    }
    prevBtn = value;
    clear.textContent = 'C';
}

function processDec(target) {
    const value = target.dataset.value;

    if (currNum.includes('.')) {
        return;
    } else if (currNum === '') {
        currNum = '0.';
        display.dataset.value += currNum;
    } else {
        currNum += '.';
        display.dataset.value += value;
    }
    prevBtn = value;
    clear.textContent = 'C';
}

function processSign() {
    let opIndex;

    if (currNum === '' ||
        currNum === '0' ||
        display.dataset.value.at(-1) === '(') {
        return;
    }

    if (/^\d+\.?\d*%?$/.test(currNum)) {
        opIndex = (display.dataset.value.at(-1) === '%') ? lastRegIndex(display.dataset.value, operator) :
                                                           lastRegIndex(display.dataset.value, /[+\-*/%]/);
        currNum = `(-${currNum})`;

    } else if (/^\(-\d+\.?\d*%?\)$/.test(currNum)) {
        opIndex = (display.dataset.value.at(-1) === '%') ? lastRegIndex(display.dataset.value, operator, 2) :
                                                           lastRegIndex(display.dataset.value, /[+\-*/%]/, 2);
        currNum = currNum.slice(2, -1);
    } else if (/^-\d+\.?\d*%?$/.test(currNum)) {
        opIndex = (display.dataset.value.at(-1) === '%') ? lastRegIndex(display.dataset.value, operator, 2) :
                                                           lastRegIndex(display.dataset.value, /[+\-*/%]/, 2);
        currNum = currNum.slice(-(currNum.length - 1));                                                                
    }

    display.dataset.value = display.dataset.value.slice(0, opIndex + 1) + currNum;
}

function processDelete() {
    const digDec = /[\d$.]/;

    if (display.dataset.value === "Undefined") {
        return;
    }
    
    if (display.dataset.value.at(-1) === ')') {
        const parenIndex = lastRegIndex(display.dataset.value, /\(/);
        if (display.dataset.value.at(parenIndex - 1) === '+' && display.dataset.value.at(parenIndex + 1) === '-') {
            display.dataset.value = display.dataset.value.slice(0, parenIndex - 1) +
                                    display.dataset.value.slice((display.dataset.value.length - (parenIndex + 1)), -1);
        } else {
            display.dataset.value = display.dataset.value.slice(0, parenIndex) +
                                    display.dataset.value.slice((display.dataset.value.length - (parenIndex + 1)), -1);
        }
    } else {
        display.dataset.value = display.dataset.value.slice(0, -1);
    }
    if (display.dataset.value === '') {
        currNum = '0';
        display.dataset.value = '0';
    }
    if (operator.test(display.dataset.value)) {
        currNum = '';
    } else if (digDec.test(display.dataset.value.at(-1))) {
        const opIndex = lastRegIndex(display.dataset.value, /[+\-*/%]/);
        currNum = display.dataset.value.slice(-(display.dataset.value.length - opIndex));
    } else if (currNum) {
        currNum.slice(0, -1);
    }

}

function processClear() {
    const clearContent = clear.textContent;
    
    if (clearContent === 'AC') {
        currNum = '0';
        display.dataset.value = '0';
    } else if (clearContent === 'C') {
        const opIndex = lastRegIndex(display.dataset.value, /[+\-*/%]/);

        currNum = '';
        display.dataset.value = display.dataset.value.slice(0, opIndex + 1);
        if (display.dataset.value === '') {
            currNum = '0';
            display.dataset.value = '0';
        }
        clear.textContent = 'AC';        
    }
}

function lastRegIndex(str, regex, negIndex = 1) {
    const gRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
    const matches = [...str.matchAll(gRegex)];
    return (matches.length >= negIndex) ? matches.at(-negIndex).index : -1;
}