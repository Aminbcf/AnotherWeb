const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const payload = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.success) {
            // Save user info
            localStorage.setItem('candidateId', result.id);
            localStorage.setItem('userRole', result.role);

            // Redirect based on role
            if (result.role === 'admin') {
                window.location.href = "admin.html";
            } else {
                window.location.href = "main.html";
            }
        } else {
            errorMsg.textContent = result.message;
        }
    });
}
