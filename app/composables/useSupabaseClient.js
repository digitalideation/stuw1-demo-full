import { createClient } from "@supabase/supabase-js";

// Using the service role key (bypasses RLS)
export const supabase = createClient(
  "https://pkxwxakjdboocyirokxi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBreHd4YWtqZGJvb2N5aXJva3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjExOTgsImV4cCI6MjA3NjY5NzE5OH0.3IislTLU2IQoldT5T7ekC6j5bD7HWzo8aD_Ea3O6UGU"
);
