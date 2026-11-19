// Tells whether an async result still belongs to the newest request, so a slow
// response cannot overwrite newer state, for example personal data arriving
// after logout.
export function createLatestRequest() {
  let latest = 0;
  return {
    next: () => {
      latest += 1;
      return latest;
    },
    isCurrent: (token) => token === latest,
  };
}
