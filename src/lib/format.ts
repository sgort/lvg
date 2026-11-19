// Formatting only, with Intl in nl-NL. Never rounds to another precision, adds, compares or
// converts: the API delivers final values.

const euro = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  trailingZeroDisplay: 'stripIfInteger',
});

const getal = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 20 });

// The API's dates are calendar dates (YYYY-MM-DD); UTC keeps them on the same day.
const datum = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export const formatEuro = (bedrag: number): string => euro.format(bedrag);

export const formatGetal = (waarde: number): string => getal.format(waarde);

export const formatDatum = (iso: string): string => datum.format(new Date(`${iso}T00:00:00Z`));
