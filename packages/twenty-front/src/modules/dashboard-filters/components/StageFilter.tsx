type StageFilterProps = {
  value: string;
  onChange: (value: string) => void;
};

export const StageFilter = ({ value, onChange }: StageFilterProps) => (
  <label>
    Stage
    <select
      aria-label="Stage"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">All stages</option>
      <option value="NEW">New</option>
      <option value="QUALIFIED">Qualified</option>
      <option value="CLOSED_WON">Closed Won</option>
    </select>
  </label>
);
