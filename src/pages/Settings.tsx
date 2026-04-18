import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserProfile } from '@/types/userProfile';
import { useHabits } from '@/hooks/useHabits';
import { StreakWarningDialog } from '@/components/StreakWarningDialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, Eye, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsProps {
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
}

const Settings = ({ profile, onUpdate }: SettingsProps) => {
  const navigate = useNavigate();
  const { pauseConsciousEnabled, setPauseConsciousEnabled } = useHabits();
  const [form, setForm] = useState(profile);
  const [showWarningPreview, setShowWarningPreview] = useState(false);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const handleSave = () => {
    onUpdate(form);
    toast.success('Configurações salvas!');
  };

  const hasChanges =
    form.name !== profile.name ||
    form.email !== profile.email ||
    form.bio !== profile.bio ||
    form.notificationsEnabled !== profile.notificationsEnabled;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-5 pt-10 pb-6">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-full hover:bg-muted w-9 h-9 -ml-1"
            >
              <ArrowLeft className="w-[18px] h-[18px]" />
            </Button>
            <h1 className="text-[26px] font-display font-bold text-foreground tracking-tight">Configurações</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-5 pb-24 space-y-5">
        {/* Profile */}
        <section className="rounded-2xl bg-card border border-border p-5 space-y-4">
          <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-widest">
            Perfil
          </h2>

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-muted-foreground">Nome</Label>
              <Input
                id="name"
                placeholder="Seu nome (opcional)"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="rounded-xl bg-background border-border h-10"
                maxLength={100}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-muted-foreground">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com (opcional)"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="rounded-xl bg-background border-border h-10"
                maxLength={255}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-xs text-muted-foreground">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Uma frase sobre você... (opcional)"
                value={form.bio}
                onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
                className="rounded-xl bg-background border-border resize-none min-h-[72px]"
                maxLength={300}
              />
              <p className="text-[10px] text-muted-foreground/50 text-right">{form.bio.length}/300</p>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-2xl bg-card border border-border p-5 space-y-3.5">
          <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-widest">
            Notificações
          </h2>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Lembrete diário</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                E-mail às 22h com hábitos pendentes
              </p>
            </div>
            <Switch
              checked={form.notificationsEnabled}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, notificationsEnabled: checked }))}
              disabled={!form.email}
            />
          </div>
          {!form.email && (
            <p className="text-[10px] text-muted-foreground/50 italic">
              Adicione um e-mail para ativar notificações.
            </p>
          )}
        </section>

        {/* Pause conscious habit */}
        <section className="rounded-2xl bg-card border border-border p-5 space-y-3.5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">Pausa sem tela</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
                  Essencial
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Ative para adicionar um hábito diário que lembra você a pausar um momento longe das telas, desacelerar e fazer algo fora do digital.
              </p>
            </div>
            <Switch
              checked={pauseConsciousEnabled}
              onCheckedChange={(checked) => setPauseConsciousEnabled(checked)}
            />
          </div>
        </section>

        <section className="rounded-2xl bg-card border border-border p-5 space-y-3.5">
          <div className="space-y-1.5">
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-widest">
              Experiência
            </h2>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Veja como aparece o aviso de proteção da sequência para entender a mensagem e o visual antes que ele seja exibido automaticamente.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowWarningPreview(true)}
            className="w-full h-11 rounded-full gap-2 border-border bg-background text-foreground hover:bg-muted/50"
          >
            <Eye className="w-4 h-4" />
            Visualizar modal de sequência
          </Button>
        </section>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="w-full rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-sm font-medium"
        >
          <Save className="w-4 h-4" />
          Salvar
        </Button>
      </div>

      <StreakWarningDialog
        open={showWarningPreview}
        onOpenChange={setShowWarningPreview}
        title="Prévia do aviso de sequência"
        confirmLabel="Entendi"
      />
    </div>
  );
};

export default Settings;
