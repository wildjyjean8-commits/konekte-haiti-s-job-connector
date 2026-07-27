import { Link } from "@tanstack/react-router";
import { MapPin, Briefcase, Clock, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CONTRACT_TYPES, SECTORS, labelOf } from "@/lib/haiti";
import { useI18n } from "@/lib/i18n";
import { timeAgo } from "@/lib/konekte";

export type JobRow = {
  id: string;
  title: string;
  sector: string;
  department: string;
  commune: string | null;
  contract_type: string;
  salary_range: string | null;
  created_at: string;
  views_count: number;
  institutions?: { id: string; name: string; logo_url: string | null } | null;
};

export function JobCard({ job }: { job: JobRow }) {
  const { lang, t } = useI18n();
  return (
    <Card className="group overflow-hidden border-border p-4 shadow-soft transition-shadow hover:shadow-lift">
      <Link to="/jobs/$jobId" params={{ jobId: job.id }} className="block">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
            <Building2 className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-base font-bold group-hover:text-primary">{job.title}</h3>
            <p className="truncate text-sm text-muted-foreground">{job.institutions?.name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {job.commune ? `${job.commune}, ` : ""}
                {job.department}
              </span>
              <span className="inline-flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {labelOf(CONTRACT_TYPES, job.contract_type, lang)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {timeAgo(job.created_at, lang)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{labelOf(SECTORS, job.sector, lang)}</Badge>
              {job.salary_range && <Badge variant="outline">{job.salary_range}</Badge>}
              <span className="ml-auto text-xs text-muted-foreground">
                {job.views_count} {t("job.views")}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
