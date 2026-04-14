const display = document.querySelector('#display');
const buttons = document.querySelector('#buttons');

let currNum = '';
let numArr = [];
let operators = [];

buttons.addEventListener('click', (e) => {
    const target = e.target;
    const value = target.dataset.value;

    const digit = /^\d$/;
    const operator = /[+\-*/]/;

    if (digit.test(value)) {
        processNum(target);
    } else if (operator.test(value)) {
        processOp(target);
    } else if (value === '=') {
        processEq(target);
    }
})

function processNum (target) {
    currNum += target.dataset.value;
    display.textContent = (display.textContent === '0') ? target.dataset.value : display.textContent + target.dataset.value;
    console.log(currNum);
}

function processOp (target) {
    const value = target.dataset.value;

    if (value === '-') {
        if (display.textContent !== '0') {
            saveToArr(value, currNum);
            if (numArr.length === 2) {
                processEq();
            }
        } else {
            currNum += value;
        }
        display.textContent = (display.textContent == '0') ? value : display.textContent + value;
    } else {
        saveToArr(value, currNum);
        if (numArr.length === 2) {
            processEq();
        }
        display.textContent += value;
    }
    console.log(currNum, numArr, operators);
}

function processEq () {
    numArr.push(currNum);
    const aNum = Number(numArr[0]);
    const bNum = Number(numArr[1]);
    const op = operators[0];

    console.log(aNum, bNum, op);

    numArr.length = 0;
    operators.shift();
    numArr.push(`${operate(aNum, bNum, op)}`);
    currNum = '';
    display.textContent = numArr[0];
    console.log(numArr);
}

function saveToArr(val, num) {
    numArr.push(num);
    operators.push(val);
    currNum = '';
}

function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    return a / b;
}

function operate(a, b, operator) {
    if ([a, b, operator].includes(undefined)) {
        return currNum;
    }
    switch (operator) {
        case '+':
            return add(a, b);
        case '-':
            return subtract(a, b);
        case '*':
            return multiply(a, b);
        case '/':
            return divide(a, b);
    }
}