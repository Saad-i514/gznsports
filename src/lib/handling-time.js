export const isHandlingTime = (spec) => spec?.key === "handling_time";
export function handlingTime(product) {
  const spec = product.specs?.find(isHandlingTime);
  if (!spec) return null;
  const { min_days: min, max_days: max } = spec;
  return Number.isInteger(min) &&
    Number.isInteger(max) &&
    min >= 0 &&
    max >= min &&
    max <= 365
    ? { min, max }
    : null;
}
export function handlingTimeText(product) {
  const days = handlingTime(product);
  if (!days) return "";
  if (days.max === 0) return "Same business day";
  return `${days.min === days.max ? days.min : `${days.min}–${days.max}`} business ${days.max === 1 ? "day" : "days"}`;
}
export function withHandlingTime(specs, minimum, maximum) {
  const rest = specs.filter((spec) => !isHandlingTime(spec));
  if (minimum === "" && maximum === "") return rest;
  const min = Number(minimum),
    max = Number(maximum);
  if (
    minimum === "" ||
    maximum === "" ||
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    min < 0 ||
    max < min ||
    max > 365
  )
    throw new Error(
      "Enter a handling-time range from 0 to 365 business days, with the maximum at least the minimum.",
    );
  const spec = {
    key: "handling_time",
    label: "Handling time",
    min_days: min,
    max_days: max,
  };
  spec.value = `${handlingTimeText({ specs: [spec] })} before dispatch`;
  return [...rest, spec];
}
