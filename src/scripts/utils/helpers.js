export function formatedPrice(price) {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(price);
}

export function timestampToDate(timestamp) {
  const datetime = new Date(timestamp * 1000);
  const datetimeArr = [datetime.getFullYear(), datetime.getMonth() + 1, datetime.getDate()];
  return datetimeArr.join('/');
}
