function stringifyApiError(value) {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return stringifyApiError(value[0]);
  if (typeof value === 'object') {
    return value.message || value.error || JSON.stringify(value);
  }
  return String(value);
}

export function extractErrorMessage(err) {
  const apiErrors = err?.errors ?? err?.response?.data?.errors;
  const fromErrors = stringifyApiError(apiErrors);
  if (fromErrors) return fromErrors;
  if (err?.response?.data?.message) return String(err.response.data.message);
  if (err?.message) return String(err.message);
  return 'Terjadi kesalahan, coba lagi.';
}
