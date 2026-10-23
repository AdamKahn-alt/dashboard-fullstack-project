import apiRequestFetch from "/js/fetchAPIrequest.js";

const forgotPasswordForm = document.getElementById("forgotPasswordForm");

const forgotPasswordInput = document.getElementById("resetEmail");
const forgotPasswordMessage = document.getElementById("forgotPasswordMessage");
const forgotPasswordBtn = document.querySelector(".login-button");

forgotPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = forgotPasswordInput.value.trim().toLowerCase();
  if (!email) {
    forgotPasswordMessage.textContent = "Email is required to proceed";
    return;
  }

  try {
    forgotPasswordBtn.disabled = true;
    const data = await apiRequestFetch("/user/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    forgotPasswordMessage.textContent =
      data?.message || "Password reset link sent to your email";
  } catch (error) {
    console.error(error);
    forgotPasswordMessage.textContent = error.message;
  } finally {
    forgotPasswordBtn.disabled = false;
  }
});
