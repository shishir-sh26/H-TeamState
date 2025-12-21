import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ggonrmlgebowctkleekf.supabase.co';
const supabaseKey = 'sb_publishable_kE6wF6fxCTqRUk-1a_T87A_8jtWOQG9';

export const supabase = createClient(supabaseUrl, supabaseKey);