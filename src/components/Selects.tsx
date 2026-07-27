import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEPARTMENT_NAMES, communesOf, SECTORS, CONTRACT_TYPES, EXPERIENCE_LEVELS, type Option } from "@/lib/haiti";
import { useI18n } from "@/lib/i18n";

const ALL = "__all__";

export function OptionSelect({
  options,
  value,
  onChange,
  placeholder,
  includeAll = false,
  allLabel,
}: {
  options: Option[];
  value: string | null | undefined;
  onChange: (v: string | null) => void;
  placeholder: string;
  includeAll?: boolean;
  allLabel?: string;
}) {
  const { lang } = useI18n();
  return (
    <Select value={value ?? (includeAll ? ALL : undefined)} onValueChange={(v) => onChange(v === ALL ? null : v)}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {includeAll && <SelectItem value={ALL}>{allLabel ?? placeholder}</SelectItem>}
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o[lang]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function StringSelect({
  values,
  value,
  onChange,
  placeholder,
  includeAll = false,
  allLabel,
  disabled,
}: {
  values: string[];
  value: string | null | undefined;
  onChange: (v: string | null) => void;
  placeholder: string;
  includeAll?: boolean;
  allLabel?: string;
  disabled?: boolean;
}) {
  return (
    <Select
      value={value ?? (includeAll ? ALL : undefined)}
      onValueChange={(v) => onChange(v === ALL ? null : v)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {includeAll && <SelectItem value={ALL}>{allLabel ?? placeholder}</SelectItem>}
        {values.map((v) => (
          <SelectItem key={v} value={v}>
            {v}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function LocationSelects({
  department,
  commune,
  onDepartment,
  onCommune,
  includeAll = false,
}: {
  department: string | null;
  commune: string | null;
  onDepartment: (v: string | null) => void;
  onCommune: (v: string | null) => void;
  includeAll?: boolean;
}) {
  const { t } = useI18n();
  return (
    <>
      <StringSelect
        values={DEPARTMENT_NAMES}
        value={department}
        onChange={(v) => {
          onDepartment(v);
          onCommune(null);
        }}
        placeholder={t("filter.department")}
        includeAll={includeAll}
        allLabel={`${t("filter.all")} — ${t("filter.department")}`}
      />
      <StringSelect
        values={communesOf(department)}
        value={commune}
        onChange={onCommune}
        placeholder={t("filter.commune")}
        includeAll={includeAll}
        allLabel={`${t("filter.all")} — ${t("filter.commune")}`}
        disabled={!department}
      />
    </>
  );
}

export { SECTORS, CONTRACT_TYPES, EXPERIENCE_LEVELS };
