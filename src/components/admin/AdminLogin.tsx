import { useState } from "react";
import { Shield, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import Layout from "@/components/layout/Layout";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { loginAdmin } = useAdminAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const success = loginAdmin(email, password);
    if (!success) {
      setError("Invalid email or password");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
                <p className="text-sm text-muted-foreground">Enter your credentials</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                <Input
                  type="email"
                  placeholder="admin@richeerich.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Password</label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>

              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}

              <Button type="submit" className="w-full">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </form>

            <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Demo credentials:<br />
                Email: admin@richeerich.com<br />
                Password: admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLogin;
