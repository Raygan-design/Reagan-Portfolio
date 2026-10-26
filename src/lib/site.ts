export const site = {
  email: 'reagan@teamraygan.com',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  socials: [
    {label: 'Instagram', href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/rayganofficial'},
    {label: 'TikTok', href: 'https://www.tiktok.com/@rayganofficial'},
    {label: 'X', href: 'https://x.com/rayganofficial'},
    {label: 'LinkedIn', href: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://www.linkedin.com/in/reaganmarfo/'},
    {label: 'YouTube', href: process.env.NEXT_PUBLIC_YOUTUBE_URL || 'https://www.youtube.com/@officialraygan'},
    {label: 'Team Raygan', href: process.env.NEXT_PUBLIC_TEAM_RAYGAN_URL || 'https://teamraygan.com/'},
  ],
  ventures: [
    {name:'Team Raygan', description:'Podcasts, stories and communities', href:process.env.NEXT_PUBLIC_TEAM_RAYGAN_URL || 'https://teamraygan.com/'},
    {name:'Greyend Studio', description:'We Build Software That Drives Business Growth', href:process.env.NEXT_PUBLIC_GREYEND_URL || 'https://www.greyend.studio/'},
    {name:'Raygan Studio', description:'Video production and creative services', href:process.env.NEXT_PUBLIC_RAYGAN_STUDIO_URL || 'https://www.rayganstudio.com/'},
  ],
  podcast: process.env.NEXT_PUBLIC_PODCAST_URL || 'https://www.unscriptedwithraygan.com/',
  podcastYoutube: process.env.NEXT_PUBLIC_YOUTUBE_URL || 'https://www.youtube.com/@officialraygan',
  storyFilm: process.env.NEXT_PUBLIC_STORY_VIDEO_URL,
  reels: [process.env.NEXT_PUBLIC_REEL_1_URL, process.env.NEXT_PUBLIC_REEL_2_URL, process.env.NEXT_PUBLIC_REEL_3_URL],
};
export function safeExternalUrl(value?: string) { if (!value) return undefined; try { const url = new URL(value); return url.protocol === 'https:' ? url.href : undefined; } catch { return undefined; } }
