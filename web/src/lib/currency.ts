export function formatCurrency(value: string | number): string {
  const amount = typeof value === "string" ? parseFloat(value) : value;

  if (Number.isNaN(amount)) {
    return "R$ 0,00";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}
