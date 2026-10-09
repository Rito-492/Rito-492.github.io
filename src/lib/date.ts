// 日期工具 —— 全站共用，勿在页面里再复制 parseDate。
//
// frontmatter 两种写法都能解析（见 AGENTS.md「内容 Schema」）：
//   pubDate: "2026_04_27_12_00"   带引号，YAML 解析为 string
//   pubDate: 202604271200         不带引号，YAML 解析为 number
// 日期在 content.config.ts 的 schema 层就已转换成 Date，页面直接用即可。

export function parseDate(value: string | number): Date {
	const s = String(value);
	if (s.includes('_')) {
		const parts = s.split('_');
		return new Date(+parts[0], +parts[1] - 1, +parts[2], +parts[3], +parts[4]);
	}
	return new Date(
		+s.substring(0, 4),
		+s.substring(4, 6) - 1,
		+s.substring(6, 8),
		+s.substring(8, 10),
		+s.substring(10, 12),
	);
}

// 2026年04月27日 12:00
export function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}
