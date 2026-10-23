"use strict";

const logOutBtn = document.getElementById("logout");

const logOutUser = async () => {
  try {
    const apiFunction = await fetch(
      "http://localhost:8000/api/v1/users/user/logout",
      {
        method: "POST",
        credentials: "include",
      },
    );
    if (!apiFunction.ok) return;
    localStorage.clear();
    console.log("response type");
    console.log(apiFunction.type);
    window.location.href = "index.html";
  } catch (error) {
    console.log(error);
  }
};

logOutBtn.addEventListener("click", logOutUser);
