export const getLength = (length: number) => {
  const visibleLength = length * 1000;
  if (visibleLength < 1000) {
    return visibleLength + 'm';
  }
  return (visibleLength / 1000).toFixed(2) + 'km';
};
