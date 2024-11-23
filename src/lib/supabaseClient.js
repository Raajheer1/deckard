import {createClient} from '@supabase/supabase-js';

export const supabase = createClient('https://diunplrzlicrbxqinrnv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdW5wbHJ6bGljcmJ4cWlucm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzMzA5OTMsImV4cCI6MjA0NzkwNjk5M30.JNw9kfzX-tfwFQlsJy7zSXy6UqX1Zj6ujDm8-Vpowwk');