document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('trial-form');
    const formContainer = document.getElementById('form-container');
    const successMessage = document.getElementById('success-message');
    const announcer = document.getElementById('form-announcer');
    const voiceStatusBtn = document.getElementById('voice-status');
    const statusText = document.getElementById('status-text');

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
    }

    function clearError(inputId, errorId) {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(errorId);
        input.removeAttribute('aria-invalid');
        errorSpan.textContent = '';
    }

    function validateForm() {
        let isValid = true;
        let firstInvalidInput = null;

        // Validate Card
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        if (cardNumber.length < 15) {
            showError('card-number', 'card-error', 'Enter a valid card number.');
            isValid = false;
            firstInvalidInput = document.getElementById('card-number');
        } else {
            clearError('card-number', 'card-error');
        }

        // Validate Expiry
        const expiry = document.getElementById('expiry-date').value;
        if (!expiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
            showError('expiry-date', 'expiry-error', 'Enter valid MM/YY.');
            isValid = false;
            if(!firstInvalidInput) firstInvalidInput = document.getElementById('expiry-date');
        } else {
            clearError('expiry-date', 'expiry-error');
        }

        // Validate CVV
        const cvv = document.getElementById('cvv').value;
        if (cvv.length < 3) {
            showError('cvv', 'cvv-error', 'Enter valid CVV.');
            isValid = false;
            if(!firstInvalidInput) firstInvalidInput = document.getElementById('cvv');
        } else {
            clearError('cvv', 'cvv-error');
        }

        if (!isValid && firstInvalidInput) {
            announce("Form has errors.");
            firstInvalidInput.focus();
        }

        return isValid;
    }

    function submitTrial() {
        if (validateForm()) {
            announce("Processing trial... Success.");
            formContainer.style.display = 'none';
            successMessage.hidden = false;
            successMessage.focus();
            
            // Stop listening since we succeeded
            if(window.recognitionInstance) {
                window.recognitionInstance.stop();
                statusText.textContent = "Voice Control Stopped";
                voiceStatusBtn.classList.remove('listening');
            }
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitTrial();
    });

    // Voice Control Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        window.recognitionInstance = recognition;
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        let isListening = false;

        function startListening() {
            try {
                recognition.start();
                isListening = true;
                voiceStatusBtn.classList.add('listening');
                statusText.textContent = "Listening... Say 'Submit' to start trial.";
            } catch(e) {}
        }

        voiceStatusBtn.addEventListener('click', () => {
            if(!isListening) {
                startListening();
            }
        });

        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const transcript = event.results[current][0].transcript.trim().toLowerCase();

            // Form commands
            if (transcript.includes('submit') || transcript.includes('start trial')) {
                submitTrial();
            }
        };

        recognition.onerror = (event) => {
            if(event.error === 'not-allowed') {
                statusText.textContent = "Microphone blocked.";
                voiceStatusBtn.classList.remove('listening');
                isListening = false;
            }
        };

        recognition.onend = () => {
            if (successMessage.hidden === true) {
                try { recognition.start(); } catch(e) {}
            }
        };

    } else {
        statusText.textContent = "Voice Control not supported.";
    }
});
