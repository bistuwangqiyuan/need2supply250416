import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://smbksxmlfxfiohahdeqv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtYmtzeG1sZnhmaW9oYWhkZXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM4MDcyNCwiZXhwIjoyMDU5OTU2NzI0fQ.INNF42OHftdD9DIJF5DZjjo8byJJh0vhfCG7z8tSd1U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createResourcesTable() {
  try {
    const { error } = await supabase.rpc('create_resources_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.resources (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          price_type TEXT NOT NULL, -- 'fixed', 'hourly', 'negotiable'
          price NUMERIC,
          availability TEXT NOT NULL, -- 'available', 'busy', 'unavailable'
          skills TEXT[] NOT NULL,
          experience_years INTEGER NOT NULL,
          portfolio_links TEXT[],
          contact TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );

        -- 创建RLS策略
        ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

        -- 创建查看策略（所有人都可以查看）
        CREATE POLICY "允许所有人查看资源" ON public.resources
          FOR SELECT USING (true);

        -- 创建插入策略（已认证用户可以创建）
        CREATE POLICY "允许认证用户创建资源" ON public.resources
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        -- 创建更新策略（只有创建者可以更新）
        CREATE POLICY "允许创建者更新资源" ON public.resources
          FOR UPDATE USING (auth.uid() = user_id);

        -- 创建删除策略（只有创建者可以删除）
        CREATE POLICY "允许创建者删除资源" ON public.resources
          FOR DELETE USING (auth.uid() = user_id);

        -- 创建触发器函数来自动更新updated_at
        CREATE OR REPLACE FUNCTION public.update_resources_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = TIMEZONE('utc'::text, NOW());
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        -- 创建触发器
        CREATE TRIGGER update_resources_updated_at
          BEFORE UPDATE ON public.resources
          FOR EACH ROW
          EXECUTE FUNCTION public.update_resources_updated_at();
      `
    });

    if (error) {
      throw error;
    }

    console.log('资源表创建成功！');
  } catch (error) {
    console.error('创建资源表失败:', error);
  }
}

createResourcesTable(); 