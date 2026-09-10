const form = document.getElementById('tip-calculator-form');
const billInput = document.getElementById('bill-input');
const peopleInput = document.getElementById('people-input');
const customTipInput = document.getElementById('custom-tip');
const billError = document.getElementById('bill-error');
const tipError = document.getElementById('tip-error');
const peopleZeroError = document.getElementById('people-zero-error');
const peopleNegativeError = document.getElementById('people-negative-error');
const peopleFractionError = document.getElementById('people-fraction-error');
const tipAmountOutput = document.getElementById('tip-amount');
const totalAmountOutput = document.getElementById('total-amount');
const resultsPanel = document.querySelector('.results-panel');
const tipButtons = Array.from(document.querySelectorAll('.tip-button'));

function getTipPercent() {
  const selected = document.querySelector('.tip-button.is-selected');
  if (selected && selected !== customTipInput) return parseFloat(selected.getAttribute('tip'));
  return parseFloat(customTipInput.value) || 0;
}

// rounds up to the next cent. float noise: 1.1 * 100 is actually
// 110.00000000000001 in JS (same for 2.2, 4.4, 8.8...), so plain
// ceil would show $1.11 instead of $1.10 — the - 0.000001 eats that.
// toFixed(2) is what makes "$3" print as "$3.00".
function roundUpCents(amount) {
  return (Math.ceil(amount * 100 - 0.000001) / 100).toFixed(2);
}

function wipe() {
  billError.classList.remove('is-visible');
  tipError.classList.remove('is-visible');
  peopleZeroError.classList.remove('is-visible');
  peopleNegativeError.classList.remove('is-visible');
  peopleFractionError.classList.remove('is-visible');
  resultsPanel.classList.remove('is-invalid');
  tipAmountOutput.textContent = '$0.00';
  totalAmountOutput.textContent = '$0.00';
}

function update() {
  wipe();

  const bill = parseFloat(billInput.value) || 0;
  const people = parseFloat(peopleInput.value) || 0;
  const tipPercent = getTipPercent();

  const billNegative = billInput.value !== '' && bill < 0;
  const tipNegative = customTipInput.value !== '' && parseFloat(customTipInput.value) < 0;

  let peopleErrorEl = null;
  if (peopleInput.value !== '') {
    if (people < 0) {
      peopleErrorEl = peopleNegativeError;
    } else if (people === 0) {
      peopleErrorEl = peopleZeroError;
    } else if (people % 1 !== 0) {
      peopleErrorEl = peopleFractionError;
    }
  }

  if (billNegative) {
    billError.classList.add('is-visible');
  }
  if (tipNegative) {
    tipError.classList.add('is-visible');
  }
  if (peopleErrorEl !== null) {
    peopleErrorEl.classList.add('is-visible');
  }

  const hasError = billNegative || tipNegative || peopleErrorEl !== null;

  if (hasError) {
    resultsPanel.classList.add('is-invalid');
    return;
  }

  if (people <= 0) {
    return;
  }

  const tipTotal = (bill * tipPercent) / 100;
  tipAmountOutput.textContent = '$' + roundUpCents(tipTotal / people);
  totalAmountOutput.textContent = '$' + roundUpCents((bill + tipTotal) / people);
}

function selectTip(button) {
  tipButtons.forEach((b) => {
    if (b === button) {
      b.classList.add('is-selected');
    } else {
      b.classList.remove('is-selected');
    }
  });
  customTipInput.value = '';
  update();
}

tipButtons.forEach((button) => {
  if (button.classList.contains('custom-tip-input')) return;
  button.addEventListener('click', () => selectTip(button));
});

customTipInput.addEventListener('input', () => {
  tipButtons.forEach((b) => {
    if (b === customTipInput && customTipInput.value !== '') {
      b.classList.add('is-selected');
    } else {
      b.classList.remove('is-selected');
    }
  });
  update();
});

billInput.addEventListener('input', update);
peopleInput.addEventListener('input', update);
customTipInput.addEventListener('input', update);

form.addEventListener('reset', () => {
  tipButtons.forEach((b) => b.classList.remove('is-selected'));
  wipe();
});
