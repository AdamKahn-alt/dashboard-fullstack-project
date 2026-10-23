const userName = document.getElementById("userName");
const storedUser = localStorage.getItem("user");
const userData = storedUser ? JSON.parse(storedUser) : null;

userName.textContent =
  userData?.fullname?.split(" ").slice(0, 1).join(" ") || "User";
