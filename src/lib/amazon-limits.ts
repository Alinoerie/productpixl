export const AMAZON_TITLE_MAX = 200;
export const AMAZON_BULLET_MAX = 500;

export function charCountLabel(value: string, max: number) {
  const len = value.length;
  const over = len > max;
  return { len, over, label: `${len}/${max}` };
}
