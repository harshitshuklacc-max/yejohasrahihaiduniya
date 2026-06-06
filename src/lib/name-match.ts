export function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function namesMatch(a: string, b: string) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

export function matchStudentId(
  personName: string,
  students: { id: string; user: { name: string } }[]
) {
  const exact = students.find((s) => namesMatch(personName, s.user.name));
  return exact?.id ?? null;
}

export function matchTeacherId(
  personName: string,
  teachers: { id: string; user: { name: string } }[]
) {
  const exact = teachers.find((t) => namesMatch(personName, t.user.name));
  return exact?.id ?? null;
}
