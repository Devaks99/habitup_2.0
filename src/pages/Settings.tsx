import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserProfile } from '@/types/userProfile';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, FileText, Bell, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsProps {
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
}

const Settings = ({ profile, onUpdate }: SettingsProps) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(profile);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const handleSave = () => {
    onUpdate(form);
    toast.success('Configurações salvas com sucesso!');
  };

  const hasChanges =
    form.name !== profile.name ||
    form.email !== profile.email ||
    form.bio !== profile.bio ||
    form.notificationsEnabled !== profile.notificationsEnabled;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border/50 rounded-b-3xl">
        <div className="mx-auto max-w-lg px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-xl hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold text-foreground">Configurações</h1>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* Profile Section */}
        <section className="rounded-2xl bg-card border border-border p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Perfil
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                Nome
              </Label>
              <Input
                id="name"
                placeholder="Seu nome (opcional)"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="rounded-xl bg-background border-border"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com (opcional)"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="rounded-xl bg-background border-border"
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                Bio
              </Label>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre você... (opcional)"
                value={form.bio}
                onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
                className="rounded-xl bg-background border-border resize-none min-h-[80px]"
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground text-right">{form.bio.length}/300</p>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Notificações
            </h2>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Alerta de hábitos pendentes</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receba um e-mail às 22h quando houver hábitos não concluídos no dia.
              </p>
            </div>
            <Switch
              checked={form.notificationsEnabled}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, notificationsEnabled: checked }))}
              disabled={!form.email}
            />
          </div>
          {!form.email && form.notificationsEnabled === false && (
            <p className="text-xs text-muted-foreground/70 italic">
              Informe seu e-mail acima para ativar as notificações.
            </p>
          )}
        </section>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="w-full rounded-xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium"
        >
          <Save className="w-4 h-4" />
          Salvar alterações
        </Button>
      </div>
    </div>
  );
};

export default Settings;
