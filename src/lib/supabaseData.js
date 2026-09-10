export function withLegacyDates(record) {
  if (!record || typeof record !== "object") {
    return record;
  }

  return {
    ...record,
    created_date: record.created_date ?? record.created_at ?? null,
    updated_date: record.updated_date ?? record.updated_at ?? null,
  };
}

export function withLegacyDatesList(records) {
  return (records || []).map(withLegacyDates);
}

export function logSupabaseError(context, error) {
  console.error(`${context}:`, error);
}
