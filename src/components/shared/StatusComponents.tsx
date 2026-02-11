import { cn } from '@/lib/utils';
import { ProjectStatus } from '@/types/pmo';

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  verde: { label: 'No prazo', className: 'status-badge-green' },
  amarelo: { label: 'Atenção', className: 'status-badge-yellow' },
  vermelho: { label: 'Crítico', className: 'status-badge-red' },
  concluido: { label: 'Concluído', className: 'status-badge-blue' },
  pausado: { label: 'Pausado', className: 'status-badge' },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = statusConfig[status];
  return <span className={config.className}>{config.label}</span>;
}

export function HealthBar({ value, className }: { value: number; className?: string }) {
  const color = value >= 75 ? 'hsl(var(--success))' : value >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-medium text-muted-foreground w-8 text-right">{value}%</span>
    </div>
  );
}

export function KPICard({ label, value, change, icon: Icon }: {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ComponentType<any>;
}) {
  return (
    <div className="kpi-card animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        {Icon && <Icon size={16} className="text-muted-foreground" />}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {change !== undefined && (
        <p className={cn("text-xs mt-1 font-medium", change >= 0 ? "text-success" : "text-destructive")}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% vs semana anterior
        </p>
      )}
    </div>
  );
}
