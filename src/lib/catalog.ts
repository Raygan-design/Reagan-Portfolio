import paper from '@/content/paper.json';

export const serviceIds = ['product-design', 'podcast-strategy', 'creative-clarity', 'pick-my-mind'] as const;
export type ServiceId = typeof serviceIds[number];
const titles = ['Product Design Direction', 'Podcast Strategy', 'Creative Clarity', 'Pick My Mind'];
const descriptions = [
  'Personal guidance for product and UI/UX designers who need clarity on their skills, portfolio or next career move.',
  'For creators and brands who need help shaping a podcast concept, format, positioning, or audience strategy.',
  'For creatives, creators and personal brands who need clarity about where they are going or what they should be creating.',
  'An open conversation for personal, professional or life questions that benefit from an honest outside perspective.',
];
const modalCopy = [paper['6JY-1'].text, paper['6KO-1'].text, paper['6M5-1'].text, paper['6NM-1'].text];
export const services = serviceIds.map((id, i) => ({id, number: String(i + 1).padStart(2, '0'), title: titles[i], description: descriptions[i], headline: modalCopy[i][1], audience: modalCopy[i][4], detail: modalCopy[i][5], questions: modalCopy[i].slice(7,11).map(q => q.replace(/^— /, '')), outcome: modalCopy[i][11]}));
export const durations = [30, 60] as const;
export type Duration = typeof durations[number];
export const prices: Record<Duration, number> = {30: 750, 60: 1002};
export const sessionNames: Record<Duration, string> = {30: 'Clarity Conversation', 60: 'Strategy Conversation'};
export function priceInPesewas(duration: Duration) { return prices[duration] * 100; }
export function money(amount: number) { return `GHS ${new Intl.NumberFormat('en-GH',{maximumFractionDigits:2}).format(amount)}`; }
export function serviceById(id: string) { return services.find(service => service.id === id); }
