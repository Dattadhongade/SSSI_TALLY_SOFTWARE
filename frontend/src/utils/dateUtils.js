export const formatDateStr = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const formatPeriodDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const formatCurrentDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  const weekday = date.toLocaleString('en-GB', { weekday: 'long' });
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const year = date.getFullYear();
  return `${weekday}, ${day}-${month}-${year}`;
};

export const getLocalISODate = () => {
  const tzoffset = (new Date()).getTimezoneOffset() * 60000;
  return new Date(Date.now() - tzoffset).toISOString().slice(0, 10);
};
