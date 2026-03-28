type OwnerFilterProps = {
  value: string;
  onChange: (value: string) => void;
};

export const OwnerFilter = ({ value, onChange }: OwnerFilterProps) => (
  <label>
    Owner
    <select
      aria-label="Owner"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">All owners</option>
      <option value="owner-1">Alice Johnson</option>
      <option value="owner-2">Bob Smith</option>
    </select>
  </label>
);
