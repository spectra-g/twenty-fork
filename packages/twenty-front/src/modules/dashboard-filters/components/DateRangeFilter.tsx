type DateRangeFilterProps = {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
};

export const DateRangeFilter = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) => (
  <fieldset>
    <legend>Date Range</legend>
    <label>
      Start date
      <input
        aria-label="Start date"
        type="date"
        value={startDate}
        onChange={(event) => onStartDateChange(event.target.value)}
      />
    </label>
    <label>
      End date
      <input
        aria-label="End date"
        type="date"
        value={endDate}
        onChange={(event) => onEndDateChange(event.target.value)}
      />
    </label>
  </fieldset>
);
