export const getColumnWidth = (label) => {
  const baseWidth = 20; // 基础宽度
  const charWidth = 10; // 每个字符的宽度（像素）
  const minWidth = 80; // 最小宽度
  const maxWidth = 300; // 最大宽度

  // 计算估计宽度
  const estimatedWidth = baseWidth + label.length * charWidth;

  // 应用限制
  return Math.max(minWidth, Math.min(estimatedWidth, maxWidth));
};
