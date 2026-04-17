import { AppLayout } from "@/components/layout/AppLayout";
import { useLocation } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminLogin } from "@workspace/api-client-react";
import { setAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useAdminLogin();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !role) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    loginMutation.mutate(
      { data: { username, password, role: role as any } },
      {
        onSuccess: (data) => {
          setAuth(data.token, data.role, data.name);
          toast({ title: "Success", description: "Logged in successfully" });
          setLocation("/admin");
        },
        onError: (err) => {
          toast({ title: "Login Failed", description: err.message || "Invalid credentials", variant: "destructive" });
        }
      }
    );
  };

  return (
    <AppLayout>
      <div className="flex-1 flex items-center justify-center bg-muted/30 p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Authorized Personnel Only</h1>
            <p className="text-muted-foreground mt-2">Secure Gateway Authentication</p>
          </div>

          <Card className="border-t-4 border-t-primary shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                System Login
              </CardTitle>
              <CardDescription>Enter your credentials to access the admin portal.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Authorization Level</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="department_manager">Department Manager</SelectItem>
                      <SelectItem value="senior_officer">Senior Officer</SelectItem>
                      <SelectItem value="general_manager">General Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Enter username" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Enter password" 
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Authenticating..." : "Authenticate"}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-muted rounded-md border text-sm">
                <p className="font-semibold mb-2">Demo Credentials:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li><strong>Dept Manager:</strong> dept_manager / password123</li>
                  <li><strong>Senior Officer:</strong> sr_officer / password123</li>
                  <li><strong>General Manager:</strong> gen_manager / password123</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
