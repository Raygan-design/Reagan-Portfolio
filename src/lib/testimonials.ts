// Testimonials from designers Reagan has mentored, shown on the homepage Consulting card and on
// the About page. Keep each quote to two or three sentences so it fits the card.
export type Testimonial={quote:string;name:string;role:string;photo?:string;href?:string};
export const testimonials:Testimonial[]=[
  {quote:'Reagan made design feel practical and attainable. His videos and design insights helped me sharpen my UI/UX skills. Watching him design live opened my mind to how far I could take it, and gave me the confidence to pursue this path.',name:'Emmanuel Peter Amexo',role:'Product Designer, MTN Ghana',photo:'/images/testimonials/emmanuel-amexo.webp',href:'https://www.linkedin.com/in/emmanuel-peter-amexo-09a0b11b8/'},
  {quote:'Reagan was always willing to review my work, challenge my thinking and share his experience. He helped me see not only how to improve, but why, and guided me from freelancing into my first full-time design role.',name:'Kwabena Safo',role:'Product Designer',photo:'/images/testimonials/kwabena-safo.jpg',href:'https://www.linkedin.com/in/kwabenasafo/'},
];
