import type {Metadata} from 'next';
import {PreviewConfirmation} from '@/components/preview-confirmation';
export const metadata:Metadata={title:'Test booking confirmation',robots:{index:false,follow:false}};
export default function PreviewConfirmationPage(){return <PreviewConfirmation/>}
