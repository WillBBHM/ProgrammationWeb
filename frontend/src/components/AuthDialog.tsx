import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Removed imports: authenticateUser, saveUser, setCurrentUser
import { setCurrentUser } from '@/data/database';
import { useToast } from '@/hooks/use-toast';

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'login' | 'register';
  onSuccess: (username: string) => void; // Pass username on success
}

const AuthDialog: React.FC<AuthDialogProps> = ({ isOpen, onOpenChange, mode, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    if (!username || !password) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
      });
      setIsLoading(false); // Stop loading
      return;
    }

    const endpoint = mode === 'login' ? 'http://127.0.0.1/login' : 'http://127.0.0.1/register';
    const body = JSON.stringify({ username, password });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });

      const data = await response.json(); // Always try to parse JSON

      if (response.ok) {
        // Handle Success (Login or Register)
        const successMessage = data.message || (mode === 'login' ? "Connexion réussie" : "Inscription réussie");
        const returnedUsername = data.user?.username || data.username || username; // Get username from response if available

        toast({
          title: mode === 'login' ? 'Connexion réussie' : 'Inscription réussie',
          description: `${successMessage} Bienvenue, ${returnedUsername}!`,
        });
        onSuccess(returnedUsername); // Pass username back
        setCurrentUser(returnedUsername);
        window.location.reload();
        onOpenChange(false);
        // Reset form fields after successful operation
        setUsername('');
        setPassword('');

      } else {
        // Handle API errors (like incorrect password, user exists)
        toast({
          variant: "destructive",
          title: "Erreur",
          description: data.message || `Une erreur est survenue lors de ${mode === 'login' ? 'la connexion' : 'l\'inscription'}.`,
        });
      }
    } catch (error) {
      // Handle Network or other fetch errors
      console.error(`Erreur ${mode === 'login' ? 'de connexion' : 'd\'inscription'}:`, error);
      toast({
        variant: "destructive",
        title: "Erreur Réseau",
        description: `Impossible de contacter le serveur. Veuillez vérifier votre connexion ou réessayer plus tard.`,
      });
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
    }
  };

  // Reset fields when dialog closes or mode changes
  React.useEffect(() => {
      if (!isOpen) {
          setUsername('');
          setPassword('');
          setIsLoading(false);
      }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'login' ? 'Connexion' : 'Inscription'}</DialogTitle>
          <DialogDescription>
            {mode === 'login'
              ? 'Entrez vos identifiants pour vous connecter.'
              : 'Créez un compte pour pouvoir effectuer des réservations.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nom d'utilisateur</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Entrez votre nom d'utilisateur"
              disabled={isLoading} // Disable input when loading
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
              disabled={isLoading} // Disable input when loading
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => { if (!isLoading) onOpenChange(false); }} // Prevent closing while loading
              type="button"
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Chargement...' : (mode === 'login' ? 'Se connecter' : 'S\'inscrire')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;

