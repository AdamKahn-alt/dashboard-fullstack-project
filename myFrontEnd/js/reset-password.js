"use strict";
import apiFetchRequest from "../js/fetchAPIrequest.js";

const tokenParams = new URLSearchParams(window.location.search).get("token");
const resetPasswordForm = document.getElementById("resetPasswordForm");
const passwordBox = document.getElementById("newPassword");
const confirmPasswordBox = document.getElementById("confirmPassword");
const btn = document.querySelector(".login-button");
const message = document.getElementById("message");

resetPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newPassword = passwordBox.value.trim();
  const confirmPassword = confirmPasswordBox.value.trim();

  if (newPassword !== confirmPassword) {
    message.textContent = "Passwords do not match";
    return;
  }

  try {
    btn.disabled = true;
    const data = await apiFetchRequest("/user/reset-password", {
      method: "POST",
      body: JSON.stringify({
        newPassword,
        token: tokenParams,
      }),
    });
    message.textContent = data?.message || "Password reset successful";
  } catch (error) {
    console.error(`error`, error);
    message.textContent = error.message;
  } finally {
    btn.disabled = false;
  }
});
