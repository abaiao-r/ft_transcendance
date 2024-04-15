
// Shows the signup section when the signup button is clicked
document.addEventListener('DOMContentLoaded', function() {
    const signupButton = document.getElementById('sign-up-button');
    const signupSection = document.getElementById('sign-up');
    const loginLink = document.querySelector(`#sign-up a[href="${LOGIN_HREF}"]`);

	// Add event listener to the signup button
    signupButton.addEventListener('click', function(event) {
		console.log("signup button clicked");
        event.preventDefault();
		window.location.href = SIGNUP_HREF;
    });

	// Shows the login section when the login link is clicked
	loginLink.addEventListener('click', function(event) {
		console.log("login link clicked");
		event.preventDefault();
		window.location.href = LOGIN_HREF;
	});
});

// Signup form submission
document.addEventListener('DOMContentLoaded', async function() {
    const signupForm = document.getElementById('sign-up-form');
    console.log("signupForm: ", signupForm);

    signupForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Collect form data
        const username = document.getElementById('sign-up-username').value;
        const email = document.getElementById('sign-up-email').value;
        const password = document.getElementById('sign-up-password').value;
        const twoFactorAuth = document.getElementById('sign-up-toggle2FA').checked;

        let data = { username, email, password };

        if (twoFactorAuth) {
            data['type_of_2fa'] = 'google_authenticator';
        }

        console.log("data: ", data);

        try {
            // Send POST request to the server
            const response = await fetch('/api/signup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'X-CSRFToken': '{{ csrf_token }}', // This line can only be used in server-rendered templates
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();
            console.log("response: ", response);
            console.log("responseData: ", responseData);

            if (!response.ok) {
                throw new Error(responseData.error || 'Signup failed.');
            }

            // Handle successful signup response
            localStorage.setItem('accessToken', responseData.access);
            localStorage.setItem('refreshToken', responseData.refresh);
            window.location.href = PLAY_HREF; // Ensure PLAY_HREF is defined
        } catch (error) {
            // Handle signup error
            console.error('Signup failed. Please try again: ', error);
            alert(error.message);
        }
    });
});



document.addEventListener("DOMContentLoaded", function() {
    const passwordInput = document.querySelector("#sign-up #sign-up-password");
    const showPasswordButton = document.querySelector("#sign-up .show-password");
    const hidePasswordButton = document.querySelector("#sign-up .hide-password");

    hidePasswordButton.style.display = "none"; // Initially hide the "Hide Password" button

    showPasswordButton.addEventListener("click", function() {
    passwordInput.type = "text";
    showPasswordButton.style.display = "none";
    hidePasswordButton.style.display = "inline";
    });

    hidePasswordButton.addEventListener("click", function() {
    passwordInput.type = "password";
    showPasswordButton.style.display = "inline";
    hidePasswordButton.style.display = "none";
    });
});