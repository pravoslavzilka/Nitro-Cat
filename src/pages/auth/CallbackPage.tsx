import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FlaskConical } from "lucide-react";

export const CallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Stub: in production, handle OAuth callback token exchange here
    const timer = setTimeout(() => {
      navigate('/pathways');
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
        <FlaskConical className="w-6 h-6 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">Completing sign in...</p>
    </div>
  );
};

export default CallbackPage;
