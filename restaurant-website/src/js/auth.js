document.addEventListener('DOMContentLoaded', function() {
    // If user is already logged in and is on the login page, redirect to dashboard
    try {
        const existingUser = localStorage.getItem('currentUser');
        if (existingUser && window.location.pathname.includes('login.html')) {
            window.location.href = '../index.html';
            return;
        }
    } catch (err) {
        console.warn('Error checking existing user:', err);
    }

    // Clear old demo data on auth pages so new users start fresh
    try {
        localStorage.removeItem('cart');
        localStorage.removeItem('salesData');
        localStorage.removeItem('menuItems');
    } catch (err) {
        console.warn('Could not clear old demo data:', err);
    }

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm) {
		// Prefill last used email/phone if available
		try {
			const savedLoginId = localStorage.getItem('lastLoginIdentifier');
			if (savedLoginId) {
				const emailInput = document.getElementById('email');
				if (emailInput && !emailInput.value) {
					emailInput.value = savedLoginId;
				}
			}
		} catch (err) {
			console.warn('Could not prefill last login identifier:', err);
		}
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

	// Remember last entered identifier for convenience
	try {
		if (email) {
			localStorage.setItem('lastLoginIdentifier', email);
		}
	} catch (err) {
		console.warn('Could not save last login identifier:', err);
	}
    
    if (!email || !password) {
        showAuthError('Please fill all fields');
        return;
    }

    // Validate email or phone
    if (!isValidEmailOrPhone(email)) {
        showAuthError('Please enter valid email or phone number');
        return;
    }

    // Check if user exists in registered accounts
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = registeredUsers.find(u => u.email === email || u.phone === email);

    if (!user) {
        showAuthError('Email/Phone not registered. Please sign up first.');
        return;
    }

    if (user.password !== password) {
        showAuthError('Incorrect password. Please try again.');
        return;
    }

    // Login successful - store current user
    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userData));

	// Clear saved identifier after successful login
	try { localStorage.removeItem('lastLoginIdentifier'); } catch (_) {}
    showAuthSuccess('Login successful! Redirecting...');
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1500);
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!name || !email || !phone || !password || !confirmPassword) {
        showAuthError('Please fill all fields');
        return;
    }

    if (!isValidEmail(email)) {
        showAuthError('Please enter valid email');
        return;
    }

    if (!isValidPhone(phone)) {
        showAuthError('Please enter valid phone number');
        return;
    }

    if (password.length < 6) {
        showAuthError('Password must be at least 6 characters');
        return;
    }

    if (password !== confirmPassword) {
        showAuthError('Passwords do not match');
        return;
    }

    // Check if user already exists
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (registeredUsers.find(u => u.email === email || u.phone === phone)) {
        showAuthError('This email or phone is already registered');
        return;
    }

    // Create new user account
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password,
        signupDate: new Date().toISOString()
    };
    
    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    // Login the new user
    const userData = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    showAuthSuccess('Account created successfully! Redirecting...');
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1500);
}

function showAuthError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        <strong>Error!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    const form = document.getElementById('login-form') || document.getElementById('signup-form');
    form?.parentElement?.insertBefore(alertDiv, form);
    setTimeout(() => alertDiv.remove(), 5000);
}

function showAuthSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        <strong>Success!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    const form = document.getElementById('login-form') || document.getElementById('signup-form');
    form?.parentElement?.insertBefore(alertDiv, form);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

function isValidEmailOrPhone(value) {
    return isValidEmail(value) || isValidPhone(value);
}