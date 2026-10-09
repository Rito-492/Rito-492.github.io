// 站点级配置 —— 换头像/邮箱/社交账号/Giscus 仓库时只改这里。
// 各组件从这里取数据，不要在 .astro 文件里硬编码。

export const SITE = {
	title: "Rito-492's Blog",
	description: 'Rito-492 的个人网站',
	url: 'https://rito-492.github.io',
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
