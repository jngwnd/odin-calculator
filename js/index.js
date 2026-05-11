const MATHJS = window.math;

const display = document.querySelector('#display');
const buttons = document.querySelector('#buttons');
const clear = document.querySelector('#clear');

const DIGIT = /\d/;
const OPERATOR = /[+\-*/]/;

const getDisplay = () => display.dataset.value;
const setDisplay = (val) => {
    display.dataset.value = val;
    display.textContent = val;
}
const lastChar = () => display.dataset.value.at(-1);

let state = {currNum: '0', prevBtn: ''};

buttons.addEventListener('click', (e) => {
    const value = e.target.dataset.value;
    const handlers = {
        '=': processEq,
        '%': processMod,
        '.': processDec,
        'delete': processDelete,
        'clear': processClear,
        'sign': processSign,
    }
    
    if (!e.target.matches('button')) return;

    if (DIGIT.test(value)) {
        processNum(value);
    } else if (OPERATOR.test(value)) {
        processOp(value);
    } else {
        handlers[value]?.(value);
    }
})

function processNum(value) {

    if (lastChar() === '%') state.currNum = '0';
    if (lastChar() === ')') setDisplay(getDisplay() + '*');
    if (state.prevBtn === '=') {
        setDisplay('');
        state.currNum = '0';
    }
    
    state.currNum = (state.currNum === '0') ? value : (state.currNum + value);
    setDisplay((getDisplay() === '0') ? value : getDisplay() + value);

    state.prevBtn = value;
    clear.textContent = 'C';
}

function processOp(value) {
    const addSub = /[+\-]/;
    
    switch (value) {
        case '-':
            state.currNum = (state.currNum === '0' && getDisplay() === '0') ? value : '';
            
            if (addSub.test(lastChar())) {
                setDisplay(getDisplay().slice(0, -1) + value);
            } else if (getDisplay() === '0') {
                setDisplay(value);
            } else {
                setDisplay(getDisplay() + value);
            }
            break;

        case '+':
        case '*':
        case '/':
            if (lastChar() === '(') return;
            
            if (lastChar() === '-' && OPERATOR.test(getDisplay().at(-2))) {
                setDisplay(getDisplay().slice(0, -2) + value);
            } else if (OPERATOR.test(lastChar())) {
                setDisplay(getDisplay().slice(0, -1) + value);
            } else {
                setDisplay(getDisplay() + value);
            }

            state.currNum = '';
            break;
    }

    state.prevBtn = value;
    clear.textContent = 'C';
}

function processEq(value) {
    if (OPERATOR.test(lastChar()) || lastChar() === '(') return;
    
    const result = MATHJS.evaluate(getDisplay());
    state.currNum = parseFloat(result.toFixed(10)).toString();
    setDisplay((state.currNum === "Infinity") ? "Undefined" : state.currNum);
    state.prevBtn = value;
    clear.textContent = 'AC';
}

function processMod(value) {
    if (lastChar() === '(') return;

    const getOpSegment = () => {
        const opIndex = lastRegIndex(getDisplay(), OPERATOR);
        return getDisplay().slice(opIndex + 1, -1) + '%';
    }

    if (OPERATOR.test(lastChar())) {

        setDisplay(getDisplay().slice(0, -1) + ((getDisplay().at(-2) === '%') ? '' : value));
        state.currNum = getOpSegment();

    } else if (lastChar() === '%') {
        if (state.currNum === '') {
            state.currNum = getOpSegment();
        }
        state.currNum = `(${state.currNum})%`;
        setDisplay(getDisplay().slice(0, -(state.currNum.length - 3)) + state.currNum);

    } else {
        state.currNum += '%';
        setDisplay(getDisplay() + '%');
    }

    state.prevBtn = value;
    clear.textContent = 'C';
}

function processDec(value) {

    if (state.currNum.includes('.')) return;
    
    if (state.currNum === '') {
        state.currNum = '0.';
        setDisplay(getDisplay() + state.currNum);
    } else {
        state.currNum += '.';
        setDisplay(getDisplay() + value);
    }

    state.prevBtn = value;
    clear.textContent = 'C';
}

function processSign() {
    if (state.currNum === '' || state.currNum === '0' || lastChar() === '(') return;

    let opIndex;
    const isModulo = (lastChar() === '%');
    const regex = isModulo ? OPERATOR : /[+\-*/%]/;
    const PLUS_MINUS = new Set(['+', '-']);
    const OTHER_OP = new Set(['*', '/', '%']);
    const getOperator = () => getDisplay().at(opIndex);

    if (/^\d+\.?\d*%?$/.test(state.currNum)) {
        opIndex = lastRegIndex(getDisplay(), regex);
        
        if (PLUS_MINUS.has(getOperator())) {
            setDisplay(getDisplay().slice(0, opIndex) +
                       ((getOperator() === '+') ? '-' : (getOperator() === '-') ? '+' : '') +
                       state.currNum);
            return;
        } else {
            state.currNum = `(-${state.currNum})`;
        }

    } else if (/^\(-\d+\.?\d*%?\)$/.test(state.currNum)) {
        opIndex = lastRegIndex(getDisplay(), regex, 2);
        state.currNum = state.currNum.slice(2, -1);

    } else if (/^-\d+\.?\d*%?$/.test(state.currNum)) {
        opIndex = lastRegIndex(getDisplay(), regex, 2);
        state.currNum = state.currNum.slice(-(state.currNum.length - 1));                                                                
    }

    setDisplay(getDisplay().slice(0, opIndex + 1) + state.currNum);
}

function processDelete() {
    const DIG_DEC = /[\d$.]/;

    if (getDisplay() === "Undefined") return;
    
    if (lastChar() === ')') {
        const parenIndex = lastRegIndex(getDisplay(), /\(/);
        const getOperator = () => getDisplay().at(parenIndex - 1);

        if (getDisplay().at(parenIndex + 1) === '-') {
            setDisplay(getDisplay().slice(0, parenIndex - 1) +
                       ((getOperator() === '+') ? '-' : (getOperator() === '-') ? '+' : '') +
                       getDisplay().slice((getDisplay().length - parenIndex), -1));
        } else {
            setDisplay(getDisplay().slice(0, parenIndex) +
                       getDisplay().slice(parenIndex + 1, -1));
        }

    } else {
        setDisplay(getDisplay().slice(0, -1));
    }

    if (getDisplay() === '') {
        state.currNum = '0';
        setDisplay('0');
    } else if (OPERATOR.test(lastChar())) {
        state.currNum = '';
    } else if (DIG_DEC.test(lastChar())) {
        const opIndex = lastRegIndex(getDisplay(), /[+\-*/%]/);
        state.currNum = getDisplay().slice(-(getDisplay().length - (opIndex + 1)));
    } else if (state.currNum) {
        state.currNum = state.currNum.slice(0, -1);
    }
}

function processClear() {
    const clearContent = clear.textContent;
    
    if (clearContent === 'AC') {
        state.currNum = '0';
        setDisplay('0');
        
    } else if (clearContent === 'C') {
        const opIndex = lastRegIndex(getDisplay(), /[+\-*/%]/);
        const SIGNED_NUM = /^\(-\d+\.?\d*%?\)/;
        
        if (SIGNED_NUM.test(state.currNum)) {
            setDisplay(getDisplay().slice(0, -(state.currNum.length)));
        } else {
            setDisplay((getDisplay() === state.currNum) ? '0' : getDisplay().slice(0, opIndex + 1));
        }
        
        state.currNum = '';

        if (getDisplay() === '') {
            state.currNum = '0';
            setDisplay('0');
        }

        clear.textContent = 'AC';
    }
}

function lastRegIndex(str, regex, negIndex = 1) {
    const gRegex = new RegExp(regex.source, 'g');
    const matches = [...str.matchAll(gRegex)];
    return (matches.length >= negIndex) ? matches.at(-negIndex).index : -1;
}