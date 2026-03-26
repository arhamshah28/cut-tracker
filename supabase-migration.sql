-- ============================================
-- Cut Tracker v2 Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  height_cm NUMERIC NOT NULL DEFAULT 180,
  age INTEGER NOT NULL DEFAULT 25,
  gender TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-update updated_at for profiles
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. Create cuts table
CREATE TABLE IF NOT EXISTS cuts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Cut',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_weight NUMERIC NOT NULL,
  target_weight NUMERIC NOT NULL,
  phases JSONB NOT NULL DEFAULT '[]'::jsonb,
  milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
  water_cut_days JSONB NOT NULL DEFAULT '{}'::jsonb,
  meal_groups JSONB NOT NULL DEFAULT '{}'::jsonb,
  dinner_recipes JSONB NOT NULL DEFAULT '[]'::jsonb,
  workouts JSONB NOT NULL DEFAULT '[]'::jsonb,
  activities JSONB NOT NULL DEFAULT '[]'::jsonb,
  supplements JSONB NOT NULL DEFAULT '[]'::jsonb,
  schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
  rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  grocery JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only one active cut per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_cut_per_user
  ON cuts (user_id)
  WHERE status = 'active';

ALTER TABLE cuts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own cuts"
  ON cuts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cuts"
  ON cuts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cuts"
  ON cuts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cuts"
  ON cuts FOR DELETE USING (auth.uid() = user_id);

-- Auto-update updated_at for cuts
CREATE TRIGGER cuts_updated_at
  BEFORE UPDATE ON cuts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. Add cut_id to daily_logs
ALTER TABLE daily_logs
  ADD COLUMN IF NOT EXISTS cut_id UUID REFERENCES cuts(id) ON DELETE SET NULL;

-- 4. Migrate existing data: create legacy cut for each user with existing logs
INSERT INTO cuts (user_id, name, status, start_date, end_date, start_weight, target_weight,
  phases, milestones, water_cut_days, meal_groups, dinner_recipes,
  workouts, activities, supplements, schedule, rules, grocery)
SELECT DISTINCT
  dl.user_id,
  '38-Day Cut (Legacy)',
  'active',
  '2026-03-24',
  '2026-05-01',
  111,
  90,
  '[{"id":1,"name":"Water Flush","start":"2026-03-24","end":"2026-03-30","calT":1050,"wL":6},{"id":2,"name":"The Grind","start":"2026-03-31","end":"2026-04-13","calT":1020,"wL":7},{"id":3,"name":"Deep Cut","start":"2026-04-14","end":"2026-04-25","calT":950,"wL":7},{"id":4,"name":"Water Cut","start":"2026-04-26","end":"2026-04-30","calT":800,"wL":4}]'::jsonb,
  '[{"d":"2026-03-30","t":106,"l":"Mar 30"},{"d":"2026-04-06","t":102,"l":"Apr 6"},{"d":"2026-04-13","t":98,"l":"Apr 13"},{"d":"2026-04-20","t":95,"l":"Apr 20"},{"d":"2026-04-25","t":93,"l":"Apr 25"},{"d":"2026-05-01","t":90,"l":"May 1"}]'::jsonb,
  '{"2026-04-26":{"wL":8,"salt":"Normal","note":"Water loading — 8L","calT":1000},"2026-04-27":{"wL":8,"salt":"Normal","note":"Water loading — 8L","calT":1000},"2026-04-28":{"wL":4,"salt":"ZERO","note":"Salt cut. Only haldi pepper lemon.","calT":900},"2026-04-29":{"wL":2,"salt":"ZERO","note":"Tea + 1 shake + 100g paneer only","calT":350},"2026-04-30":{"wL":0.5,"salt":"ZERO","note":"Sips only. Minimal food.","calT":150}}'::jsonb,
  '{"morning":[{"id":"acv","n":"ACV + Warm Water","c":5,"p":0,"t":"6:45 AM"},{"id":"greentea","n":"Green Tea + Chia Seeds","c":60,"p":2,"t":"7:00 AM"},{"id":"shake1","n":"Protein Shake (22g)","c":140,"p":22,"t":"9:30 AM"},{"id":"almonds","n":"Almonds (3-4)","c":25,"p":1,"t":"9:45 AM"}],"lunch":[{"id":"l_roti","n":"Roti + Sabzi + Salad + Chaas","c":280,"p":8,"t":"1:00 PM"},{"id":"l_chilla","n":"Besan Chilla + Sabzi + Salad + Chaas","c":250,"p":12,"t":"1:00 PM"},{"id":"l_light","n":"Sabzi + Salad + Chaas only","c":150,"p":5,"t":"1:00 PM"}],"preworkout":[{"id":"coffee","n":"Americano (Black)","c":5,"p":0,"t":"4:30 PM"}],"postworkout":[{"id":"shake2","n":"Post-Workout Shake (22g)","c":140,"p":22,"t":"6:45 PM"}],"night":[{"id":"isabgol","n":"Isabgol + Warm Water","c":10,"p":0,"t":"10:00 PM"}]}'::jsonb,
  '[{"i":1,"n":"Black Pepper Capsicum","c":350,"p":37,"g":"Indian"},{"i":2,"n":"Coriander-Mint Tikka","c":360,"p":38,"g":"Indian"},{"i":3,"n":"Tandoori Paneer","c":355,"p":38,"g":"Indian"},{"i":4,"n":"Achari Paneer","c":360,"p":37,"g":"Indian"},{"i":5,"n":"Methi Paneer","c":360,"p":37,"g":"Indian"},{"i":6,"n":"Pahadi Tikka","c":360,"p":39,"g":"Indian"},{"i":7,"n":"Paneer Amritsari","c":370,"p":38,"g":"Indian"},{"i":8,"n":"Paneer Afghani","c":365,"p":40,"g":"Indian"},{"i":9,"n":"Kali Mirch","c":355,"p":38,"g":"Indian"},{"i":10,"n":"Tawa Masala","c":365,"p":38,"g":"Indian"},{"i":11,"n":"Chatpata","c":355,"p":37,"g":"Indian"},{"i":12,"n":"Tikka Masala","c":365,"p":39,"g":"Indian"},{"i":13,"n":"Hariyali Tikka","c":355,"p":38,"g":"Indian"},{"i":14,"n":"Hara Bhara","c":355,"p":38,"g":"Indian"},{"i":15,"n":"Pudina Tikka","c":355,"p":37,"g":"Indian"},{"i":16,"n":"Ajwain Tikka","c":360,"p":38,"g":"Indian"},{"i":17,"n":"Lababdar Dry","c":365,"p":38,"g":"Indian"},{"i":18,"n":"Peri Peri","c":360,"p":38,"g":"Indian"},{"i":19,"n":"Rajasthani Kebab","c":370,"p":39,"g":"Indian"},{"i":20,"n":"Chettinad","c":365,"p":38,"g":"Indian"},{"i":22,"n":"Thai Basil","c":365,"p":38,"g":"Intl"},{"i":24,"n":"Mexican Fajita","c":375,"p":39,"g":"Intl"},{"i":25,"n":"Lebanese Shawarma","c":375,"p":40,"g":"Intl"},{"i":26,"n":"Italian Caprese","c":345,"p":37,"g":"Intl"},{"i":27,"n":"Szechuan","c":370,"p":38,"g":"Intl"},{"i":29,"n":"Greek Herb","c":365,"p":37,"g":"Intl"},{"i":30,"n":"Spanish Romesco","c":375,"p":38,"g":"Intl"},{"i":31,"n":"Vietnamese Lemongrass","c":360,"p":38,"g":"Intl"},{"i":33,"n":"Turkish Shish","c":370,"p":39,"g":"Intl"},{"i":34,"n":"Peruvian Aji","c":365,"p":38,"g":"Intl"},{"i":36,"n":"French Provencal","c":360,"p":37,"g":"Intl"},{"i":40,"n":"Zaatar","c":365,"p":38,"g":"Intl"},{"i":41,"n":"Tomato Soup","c":295,"p":30,"g":"Soup"},{"i":42,"n":"Lemon Coriander Soup","c":280,"p":28,"g":"Soup"},{"i":43,"n":"Moong Dal Soup","c":310,"p":32,"g":"Soup"},{"i":48,"n":"Green Pea Soup","c":295,"p":30,"g":"Soup"},{"i":50,"n":"Chana Dal Soup","c":310,"p":32,"g":"Soup"},{"i":52,"n":"Broccoli Soup","c":290,"p":30,"g":"Soup"},{"i":55,"n":"French Pistou","c":300,"p":29,"g":"Soup"},{"i":57,"n":"Minestrone","c":310,"p":30,"g":"Soup"},{"i":61,"n":"Sprouted Moong Bowl","c":370,"p":38,"g":"Bowl"},{"i":62,"n":"Mediterranean Salad","c":365,"p":37,"g":"Bowl"},{"i":63,"n":"Burrito Bowl","c":380,"p":38,"g":"Bowl"},{"i":65,"n":"Fattoush","c":360,"p":36,"g":"Bowl"},{"i":67,"n":"Kala Chana Chaat","c":375,"p":38,"g":"Bowl"},{"i":70,"n":"Quinoa Bowl","c":385,"p":38,"g":"Bowl"},{"i":73,"n":"Sprouted Lentil","c":360,"p":36,"g":"Bowl"},{"i":74,"n":"Caprese Tower","c":345,"p":36,"g":"Bowl"},{"i":78,"n":"Corn Chickpea Salad","c":370,"p":37,"g":"Bowl"},{"i":79,"n":"Raita Bowl","c":335,"p":36,"g":"Bowl"}]'::jsonb,
  '[{"id":"chest","d":"Mon","n":"Chest + Triceps","b":550},{"id":"back","d":"Tue","n":"Back + Biceps","b":570},{"id":"quads","d":"Wed","n":"Legs: Quads ★","b":550},{"id":"shoulders","d":"Thu","n":"Shoulders + Core","b":530},{"id":"hams","d":"Fri","n":"Legs: Hams ★","b":540},{"id":"arms","d":"Sat","n":"Arms + Circuit","b":500},{"id":"rest","d":"Sun","n":"Rest Day","b":0}]'::jsonb,
  '[{"id":"gym","n":"Gym Walk (2km)","b":165},{"id":"w30","n":"Walk 30 min","b":160},{"id":"w60","n":"Walk 60 min","b":320},{"id":"w90","n":"Walk 90 min","b":475},{"id":"w120","n":"Walk 2 hours","b":640},{"id":"hiit15","n":"HIIT 15 min","b":200},{"id":"hiit20","n":"HIIT 20 min","b":280},{"id":"hiit30","n":"HIIT 30 min","b":420},{"id":"hiit45","n":"HIIT 45 min","b":580}]'::jsonb,
  '[{"id":"whey","n":"Whey Protein x2"},{"id":"multi","n":"Multivitamin"},{"id":"omega","n":"Omega-3 Flaxseed"},{"id":"ors","n":"ORS / Electral"},{"id":"glut","n":"Glutamine 5g"},{"id":"isab","n":"Isabgol"},{"id":"acvs","n":"ACV"}]'::jsonb,
  '[["6:45","ACV + warm water"],["7:00","Green tea + chia seeds"],["9:30","Protein shake + almonds"],["1:00","Lunch"],["4:30","Americano (pre-workout)"],["5:00","Walk to gym (1km)"],["5:15","Workout + cardio"],["6:30","Walk home (1km)"],["6:45","Post-workout shake"],["8:30","Dinner (paneer recipe)"],["9:00","Evening walk 60-90 min"],["10:00","Isabgol + warm water"],["10:15","Sleep"]]'::jsonb,
  '["No cheat meals. 38 days. ZERO.","Protein above 85g/day always","Sleep 7-8 hours minimum","No alcohol","No packaged or outside food","Walk BRISK to gym — not stroll","Weigh every morning, same time","Dizzy or faint? EAT IMMEDIATELY."]'::jsonb,
  '["Paneer 1.4kg (200g × 7)","Whey protein (14 scoops)","Chia seeds 100g","Green tea bags × 7","Almonds ~25","Besan 250g","Sabzi 3-4 types","Fresh veg + coriander + lemon","Low-fat dahi ~500g","Whole wheat atta 500g","Isabgol","ORS/Electral × 10"]'::jsonb
FROM daily_logs dl
WHERE NOT EXISTS (SELECT 1 FROM cuts c WHERE c.user_id = dl.user_id);

-- 5. Link existing daily_logs to the legacy cut
UPDATE daily_logs dl
SET cut_id = (
  SELECT c.id FROM cuts c
  WHERE c.user_id = dl.user_id
  AND c.name = '38-Day Cut (Legacy)'
  LIMIT 1
)
WHERE dl.cut_id IS NULL;

-- 6. Update unique constraint
ALTER TABLE daily_logs DROP CONSTRAINT IF EXISTS daily_logs_user_id_date_key;

-- Create new constraint (handles NULLs with COALESCE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_logs_user_id_date_cut_key'
  ) THEN
    ALTER TABLE daily_logs ADD CONSTRAINT daily_logs_user_id_date_cut_key
      UNIQUE (user_id, date, cut_id);
  END IF;
END $$;

-- Done! Your database is ready for Cut Tracker v2.
