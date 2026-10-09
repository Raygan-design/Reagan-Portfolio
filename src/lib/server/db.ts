import 'server-only';
import { createClient } from '@supabase/supabase-js';
export class ConfigurationError extends Error {}
export function database(){const url=process.env.SUPABASE_URL,key=(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY);if(!url||!key)throw new ConfigurationError('Booking and contact services are not connected yet.');return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})}
