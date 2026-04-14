let aNum = 0;
let bNum = 0;
let operator = '';

const buttons = document.querySelector('#buttons');
const numbers = [...document.querySelectorAll('.number')];

buttons.addEventListener('click', (e) => {
    
})

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

function operate(aNum, operator, bNum) {
    switch (operator) {
        case '+':
            return add(aNum, bNum);
        case '-':
            return subtract(aNum, bNum);
        case '*':
            return multiply(aNum, bNum);
        case '/':
            return divide(aNum, bNum);
    }
}