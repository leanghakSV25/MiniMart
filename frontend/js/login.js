const API = "http://localhost:5000/api";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = document.getElementById("loginMessage");
  try {
    const response = await fetch(API + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    location.href = "index.html";
  } catch (error) {
    message.textContent = error.message;
  }
});
