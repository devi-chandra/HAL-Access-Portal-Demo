export function setAuth(token: string, role: string, name: string) {
  localStorage.setItem("hal_token", token);
  localStorage.setItem("hal_role", role);
  localStorage.setItem("hal_name", name);
}

export function getAuth() {
  const token = localStorage.getItem("hal_token");
  const role = localStorage.getItem("hal_role");
  const name = localStorage.getItem("hal_name");
  
  if (!token) return null;
  return { token, role, name };
}

export function clearAuth() {
  localStorage.removeItem("hal_token");
  localStorage.removeItem("hal_role");
  localStorage.removeItem("hal_name");
}
