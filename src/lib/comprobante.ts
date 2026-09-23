export function numeroComprobante(donacionId: number): string {
  return `RM-D-${String(donacionId).padStart(6, "0")}`;
}
