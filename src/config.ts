// 站点级配置 —— 换头像/邮箱/社交账号/Giscus 仓库时只改这里。
// 各组件从这里取数据，不要在 .astro 文件里硬编码。

export const SITE = {
	title: "Rito-492's Blog",
	description: 'Rito-492 的个人网站',
	url: 'https://rito-492.github.io',
	repo: 'https://github.com/Rito-492/Rito-492.github.io',
	author: 'Rito-492',
	bio: '世界很大，开心第一。',
	avatar: '/avatar.jpg',
} as const;

export type SocialId = 'email' | 'github' | 'steam';

export const SOCIALS: ReadonlyArray<{ id: SocialId; label: string; href: string }> = [
	{ id: 'email', label: 'Email', href: 'mailto:richardtowne8284@gmail.com' },
	{ id: 'github', label: 'GitHub', href: 'https://github.com/Rito-492' },
	{ id: 'steam', label: 'Steam', href: 'https://steamcommunity.com/profiles/76561199226205480/' },
];

// Giscus 评论（https://giscus.app 配置生成）
export const GISCUS = {
	repo: 'Rito-492/Rito-492.github.io',
	repoId: 'R_kgDOSEWSAg',
	category: 'Blog Comments',
	categoryId: 'DIC_kwDOSEWSAs4C8fbP',
} as const;

// 文章版权许可（文章页底部声明 + <link rel="license">；换协议只改这里）
export const LICENSE = {
	name: 'CC BY-NC-SA 4.0',
	url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
	deedUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-Hans',
} as const;

// GoatCounter 统计（SPA 模式接入见 SeoHead / Layout；首页显示总浏览数）
export const GOATCOUNTER = {
	code: 'rito-492',
} as const;
