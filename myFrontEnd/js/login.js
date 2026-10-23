const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");
const loginBtn = document.getElementById("loginBtn");
document.getElementById("email").focus();

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  loginBtn.disabled = true;

  try {
    const response = await fetch("http://localhost:8000/api/v1/users/login", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (response.status === 401)
      return (message.textContent = "Invalid Credentials");
    if (!response.ok) {
      console.error(`Login failed: ${response.status}, data: ${data}`);
      message.textContent = "Unable to log in right now. Please try again.";
      return;
    }

    const userData = data?.data;
    message.textContent = data?.message;

    if (
      userData?.role?.trim().toLowerCase() === "admin" ||
      userData.role === "super-admin"
    ) {
      window.location.href = "admin-dashboard.html";
    } else if (userData?.role?.trim().toLowerCase() === "student") {
      window.location.href = "user-dashboard.html";
    } else {
      message.textContent = "Unknown user role.";
    }
    localStorage.setItem("user", JSON.stringify(userData));
  } catch (err) {
    console.error("Error during login:", err);
    message.textContent = "Unable to log in right now. Please try again.";
  } finally {
    loginBtn.disabled = false;
  }
});
