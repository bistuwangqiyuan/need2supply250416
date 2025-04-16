import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://smbksxmlfxfiohahdeqv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtYmtzeG1sZnhmaW9oYWhkZXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM4MDcyNCwiZXhwIjoyMDU5OTU2NzI0fQ.INNF42OHftdD9DIJF5DZjjo8byJJh0vhfCG7z8tSd1U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    // 创建demands表
    const { error: demandsError } = await supabase.rpc('create_demands_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS demands (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          budget NUMERIC NOT NULL,
          deadline TIMESTAMP WITH TIME ZONE NOT NULL,
          contact TEXT NOT NULL,
          analysis_result TEXT,
          status TEXT NOT NULL DEFAULT 'open',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );

        -- 创建RLS策略
        ALTER TABLE demands ENABLE ROW LEVEL SECURITY;

        -- 创建查看策略（所有人都可以查看）
        CREATE POLICY "允许所有人查看需求" ON demands
          FOR SELECT USING (true);

        -- 创建插入策略（已认证用户可以创建）
        CREATE POLICY "允许认证用户创建需求" ON demands
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        -- 创建更新策略（只有创建者可以更新）
        CREATE POLICY "允许创建者更新需求" ON demands
          FOR UPDATE USING (auth.uid() = user_id);

        -- 创建删除策略（只有创建者可以删除）
        CREATE POLICY "允许创建者删除需求" ON demands
          FOR DELETE USING (auth.uid() = user_id);

        -- 创建触发器函数来自动更新updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = TIMEZONE('utc'::text, NOW());
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        -- 创建触发器
        CREATE TRIGGER update_demands_updated_at
          BEFORE UPDATE ON demands
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `
    });

    if (demandsError) {
      throw demandsError;
    }

    console.log('数据库表创建成功！');
  } catch (error) {
    console.error('创建表失败:', error);
  }
}

createTables(); 