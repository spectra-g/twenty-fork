export const normalizeBlocklistDescription = (description: string) => {
  const trimmedDescription = description.trim();

  return trimmedDescription.length > 0 ? trimmedDescription : null;
};
