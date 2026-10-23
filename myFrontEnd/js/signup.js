const signupForm = document.getElementById("signupForm");
const signupBtn = document.querySelector(".signup-button");
const message = document.getElementById("message");

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fullname = document.getElementById("signupFullname").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const selectedGenderRadio = document.querySelector(
    "input[name='gender']:checked",
  );
  const gender = selectedGenderRadio ? selectedGenderRadio.value : null;

  if (password !== confirmPassword) {
    message.textContent = "Passwords do not match";
    return;
  }
  signupBtn.disabled = true;

  let response;
  let data;

  try {
    response = await fetch("http://localhost:8000/api/v1/users/signup", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fullname, username, email, gender, password }),
    });
    data = await response.json();

    if (!response.ok) {
      const backendMessage = data?.message || "Unable to sign up right now.";
      console.error("Signup failed", {
        error: new Error(backendMessage),
        status: response.status,
        message: data?.message,
        data,
      });
      message.textContent = backendMessage;
      return;
    }

    message.textContent = data?.message || "Account created successfully.";
    // const user = { fullname, email, username, gender };
    // localStorage.setItem("user", JSON.stringify(user));

    if (
      data?.welcomeEmailSent === false ||
      data?.warning?.code === "WELCOME_EMAIL_FAILED"
    ) {
      alert(
        data?.message ||
          "Account created successfully, but welcome email failed to send.",
      );
    }

    window.location.href = "index.html";
  } catch (error) {
    const status = response?.status ?? "NETWORK_ERROR";
    const backendMessage = data?.message;

    console.error("Signup request failed", {
      error,
      status,
      message: backendMessage,
      data,
    });

    message.textContent =
      backendMessage || error.message || "Unable to sign up. Try again.";
  } finally {
    signupBtn.disabled = false;
  }
});
