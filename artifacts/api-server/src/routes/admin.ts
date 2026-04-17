import { Router } from "express";
import { AdminLoginBody } from "@workspace/api-zod";

const router = Router();

const DEMO_USERS = [
  { username: "dept_manager", password: "demo123", role: "department_manager", name: "Rajesh Kumar" },
  { username: "senior_officer", password: "demo123", role: "senior_officer", name: "Priya Sharma" },
  { username: "general_manager", password: "demo123", role: "general_manager", name: "Anil Mehta" },
];

router.post("/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", message: parsed.error.message });
    return;
  }

  const { username, password, role } = parsed.data;

  const user = DEMO_USERS.find(
    (u) => u.username === username && u.password === password && u.role === role
  );

  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Invalid credentials. Try: dept_manager / senior_officer / general_manager with password demo123" });
    return;
  }

  const token = `demo-token-${user.role}-${Date.now()}`;

  res.json({
    token,
    role: user.role,
    name: user.name,
  });
});

export default router;
