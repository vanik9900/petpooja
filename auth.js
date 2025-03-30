// Function to check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // List of pages that don't require authentication
    const publicPages = ['signin.html', 'signup.html'];
    
    // If user is not authenticated and trying to access a protected page
    if (!token && !publicPages.includes(currentPage)) {
        // Only redirect if not already on signin page
        if (currentPage !== 'signin.html') {
            window.location.href = 'signin.html';
        }
    }
}

// Function to handle sign in
async function handleSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    const signinBtn = document.getElementById('signinBtn');

    // Reset error states
    document.getElementById('email').classList.remove('error');
    document.getElementById('password').classList.remove('error');

    // Validate email
    if (!validateEmail(email)) {
        document.getElementById('email').classList.add('error');
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Validate password
    if (!validatePassword(password)) {
        document.getElementById('password').classList.add('error');
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }

    // Disable sign in button
    signinBtn.disabled = true;
    signinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

    try {
        // Get stored users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Find user with matching email and password
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Create a simple token (in a real app, this would be more secure)
            const token = btoa(email + ':' + new Date().getTime());
            
            // Store user data
            localStorage.setItem('userName', user.name);
            localStorage.setItem('token', token);
            if (remember) {
                localStorage.setItem('rememberMe', 'true');
            }

            showNotification('Successfully signed in!', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        // Re-enable sign in button
        signinBtn.disabled = false;
        signinBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
    }
}

// Function to handle sign out
function handleSignOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('rememberMe');
    window.location.href = 'signin.html';
}

// Function to validate email
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Function to validate password
function validatePassword(password) {
    return password.length >= 8;
}

// Function to show notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Only run auth check if we're not on a public page
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const publicPages = ['signin.html', 'signup.html'];
    
    if (!publicPages.includes(currentPage)) {
        checkAuth();
    }
}); 