document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('payment-form');
    const announcer = document.getElementById('form-announcer');
    const successMessage = document.getElementById('success-message');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');

    // Announce to screen readers
    function announce(message) {
        announcer.textContent = '';
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);
    }

    function showError(inputId, errorId, message) {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(errorId);
        input.setAttribute('aria-invalid', 'true');
        errorSpan.textContent = message;
        return false;
    }

    function clearError(inputId, errorId) {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(errorId);
        input.removeAttribute('aria-invalid');
        errorSpan.textContent = '';
        return true;
    }

    function validateForm() {
        let isValid = true;
        let firstInvalidInput = null;

        // Validate Amount
        const amount = document.getElementById('amount').value;
        if (!amount || amount <= 0) {
            showError('amount', 'amount-error', 'Please enter a valid amount greater than 0.');
            isValid = false;
            if(!firstInvalidInput) firstInvalidInput = document.getElementById('amount');
        } else {
            clearError('amount', 'amount-error');
        }

        // Validate Name
        const name = document.getElementById('card-name').value;
        if (!name.trim()) {
            showError('card-name', 'name-error', 'Name on card is required.');
            isValid = false;
            if(!firstInvalidInput) firstInvalidInput = document.getElementById('card-name');
        } else {
            clearError('card-name', 'name-error');
        }

        // Validate Card Number (simple length check for demo)
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        if (cardNumber.length < 15 || cardNumber.length > 16 || isNaN(cardNumber)) {
            showError('card-number', 'card-error', 'Please enter a valid 15 or 16 digit card number.');
            isValid = false;
            if(!firstInvalidInput) firstInvalidInput = document.getElementById('card-number');
        } else {
            clearError('card-number', 'card-error');
        }

        // Validate Expiry
        const expiry = document.getElementById('expiry-date').value;
        if (!expiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
            showError('expiry-date', 'expiry-error', 'Please enter a valid expiry date in MM/YY format.');
            isValid = false;
            if(!firstInvalidInput) firstInvalidInput = document.getElementById('expiry-date');
        } else {
            clearError('expiry-date', 'expiry-error');
        }

        // Validate CVV
        const cvv = document.getElementById('cvv').value;
        if (cvv.length < 3 || cvv.length > 4 || isNaN(cvv)) {
            showError('cvv', 'cvv-error', 'Please enter a valid 3 or 4 digit CVV.');
            isValid = false;
            if(!firstInvalidInput) firstInvalidInput = document.getElementById('cvv');
        } else {
            clearError('cvv', 'cvv-error');
        }

        if (!isValid && firstInvalidInput) {
            announce("Form has errors. Please fix them before submitting.");
            firstInvalidInput.focus();
        }

        return isValid;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (validateForm()) {
            // Simulate API call
            announce("Processing payment. Please wait.");
            submitBtn.disabled = true;
            btnText.textContent = 'Processing...';
            spinner.style.display = 'inline-block';

            setTimeout(() => {
                form.style.display = 'none';
                successMessage.hidden = false;
                successMessage.focus();
                announce("Payment successful. Thank you for your payment.");
            }, 2000);
        }
    });
});
