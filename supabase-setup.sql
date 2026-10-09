-- =========================================================================
-- 90-Day Interview Command Center - Supabase PostgreSQL Schema & Pre-Seed
-- =========================================================================
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- It will create all tables, indexes, security policies, and pre-seed all 157 topics.

-- 1. App Settings Table
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 2. Topics Table
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  pillar TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending',
  confidence INTEGER DEFAULT 1,
  day_target INTEGER DEFAULT 1,
  external_url TEXT,
  summary TEXT,
  key_intuition TEXT,
  pitfalls TEXT,
  notes TEXT,
  code_snippet TEXT,
  time_complexity TEXT,
  space_complexity TEXT,
  box INTEGER DEFAULT 1,
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  times_reviewed INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topics_pillar ON topics(pillar);
CREATE INDEX IF NOT EXISTS idx_topics_status ON topics(status);
CREATE INDEX IF NOT EXISTS idx_topics_next_review ON topics(next_review_at);

-- 3. Reviews Spaced Repetition Table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  reviewed_at TIMESTAMPTZ NOT NULL,
  confidence_rating INTEGER NOT NULL,
  outcome TEXT NOT NULL,
  box_before INTEGER NOT NULL,
  box_after INTEGER NOT NULL,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_reviews_topic ON reviews(topic_id);
CREATE INDEX IF NOT EXISTS idx_reviews_date ON reviews(reviewed_at);

-- 4. Daily Logs Table
CREATE TABLE IF NOT EXISTS daily_logs (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  topics_completed_count INTEGER DEFAULT 0,
  topics_reviewed_count INTEGER DEFAULT 0,
  study_time_minutes INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  focus_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);

-- 5. SQL Sandbox Progress Table
CREATE TABLE IF NOT EXISTS sql_progress (
  challenge_id TEXT PRIMARY KEY,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Job Applications Pipeline Table
CREATE TABLE IF NOT EXISTS job_applications (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  applied_date TEXT NOT NULL,
  status TEXT NOT NULL,
  point_of_contact TEXT,
  interview_date TEXT,
  comment TEXT,
  location TEXT,
  job_url TEXT,
  salary_range TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_date ON job_applications(applied_date);

-- Enable Row Level Security (RLS) with full access policies
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sql_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on sql_progress" ON sql_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on job_applications" ON job_applications FOR ALL USING (true) WITH CHECK (true);

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on app_settings') THEN
    CREATE POLICY "Allow all operations on app_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on topics') THEN
    CREATE POLICY "Allow all operations on topics" ON topics FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on reviews') THEN
    CREATE POLICY "Allow all operations on reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on daily_logs') THEN
    CREATE POLICY "Allow all operations on daily_logs" ON daily_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 5. Day 0 App Settings
INSERT INTO app_settings (key, value) VALUES
  ('start_date', '2026-09-29'),
  ('target_days', '90'),
  ('daily_target_topics', '3')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 6. Pre-seed All 157 Topics
INSERT INTO topics (
  id, pillar, category, title, slug, difficulty, priority, status, confidence,
  day_target, external_url, summary, key_intuition, pitfalls, notes, code_snippet,
  time_complexity, space_complexity, box, created_at, updated_at
) VALUES
(
  'dsa-lc-1',
  'dsa',
  'Phase 1: Arrays',
  'LC 1: Two Sum',
  'two-sum',
  'Easy',
  1,
  'pending',
  1,
  1,
  'https://leetcode.com/problems/two-sum/',
  'LeetCode #1 [Easy] in Phase 1: Arrays.',
  'Use Dictionary<value, index> for O(1) complement lookup.',
  'Using same index twice; sorting when original indices needed.',
  '### LC 1: Two Sum
- Category: Phase 1: Arrays
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(N)

**Intuition:**
Use Dictionary<value, index> for O(1) complement lookup.

**Pitfalls:**
Using same index twice; sorting when original indices needed.',
  NULL,
  'O(N)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-26',
  'dsa',
  'Phase 1: Arrays',
  'LC 26: Remove Duplicates from Sorted Array',
  'remove-duplicates-from-sorted-array',
  'Easy',
  1,
  'pending',
  1,
  1,
  'https://leetcode.com/problems/remove-duplicates-from-sorted-array/',
  'LeetCode #26 [Easy] in Phase 1: Arrays.',
  'Two pointers: slow pointer marks write index for unique elements.',
  'Allocating a new array; not handling empty array.',
  '### LC 26: Remove Duplicates from Sorted Array
- Category: Phase 1: Arrays
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Two pointers: slow pointer marks write index for unique elements.

**Pitfalls:**
Allocating a new array; not handling empty array.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-27',
  'dsa',
  'Phase 1: Arrays',
  'LC 27: Remove Element',
  'remove-element',
  'Easy',
  2,
  'pending',
  1,
  2,
  'https://leetcode.com/problems/remove-element/',
  'LeetCode #27 [Easy] in Phase 1: Arrays.',
  'Two pointers: overwrite matching target values in-place.',
  'Off-by-one errors with length return.',
  '### LC 27: Remove Element
- Category: Phase 1: Arrays
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Two pointers: overwrite matching target values in-place.

**Pitfalls:**
Off-by-one errors with length return.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-88',
  'dsa',
  'Phase 1: Arrays',
  'LC 88: Merge Sorted Array',
  'merge-sorted-array',
  'Easy',
  1,
  'pending',
  1,
  3,
  'https://leetcode.com/problems/merge-sorted-array/',
  'LeetCode #88 [Easy] in Phase 1: Arrays.',
  'Merge from back to front to avoid overwriting elements in nums1.',
  'Merging from front requires shifting elements or extra array.',
  '### LC 88: Merge Sorted Array
- Category: Phase 1: Arrays
- Difficulty: Easy
- Time Complexity: O(M+N)
- Space Complexity: O(1)

**Intuition:**
Merge from back to front to avoid overwriting elements in nums1.

**Pitfalls:**
Merging from front requires shifting elements or extra array.',
  NULL,
  'O(M+N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-121',
  'dsa',
  'Phase 1: Arrays',
  'LC 121: Best Time to Buy and Sell Stock',
  'best-time-to-buy-and-sell-stock',
  'Easy',
  1,
  'pending',
  1,
  4,
  'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
  'LeetCode #121 [Easy] in Phase 1: Arrays.',
  'Track running minimum price and max profit in single pass.',
  'Selling before buying; quadratic O(N^2) double loop.',
  '### LC 121: Best Time to Buy and Sell Stock
- Category: Phase 1: Arrays
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Track running minimum price and max profit in single pass.

**Pitfalls:**
Selling before buying; quadratic O(N^2) double loop.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-169',
  'dsa',
  'Phase 1: Arrays',
  'LC 169: Majority Element',
  'majority-element',
  'Easy',
  1,
  'pending',
  1,
  5,
  'https://leetcode.com/problems/majority-element/',
  'LeetCode #169 [Easy] in Phase 1: Arrays.',
  'Boyer-Moore Voting Algorithm: maintain count and candidate.',
  'Hash map uses O(N) space; Boyer-Moore achieves O(1) space.',
  '### LC 169: Majority Element
- Category: Phase 1: Arrays
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Boyer-Moore Voting Algorithm: maintain count and candidate.

**Pitfalls:**
Hash map uses O(N) space; Boyer-Moore achieves O(1) space.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-238',
  'dsa',
  'Phase 1: Arrays',
  'LC 238: Product of Array Except Self',
  'product-of-array-except-self',
  'Medium',
  1,
  'pending',
  1,
  6,
  'https://leetcode.com/problems/product-of-array-except-self/',
  'LeetCode #238 [Medium] in Phase 1: Arrays.',
  'Prefix and Suffix products: calculate left prefix in output, right suffix on return.',
  'Using division operator (forbidden by problem description).',
  '### LC 238: Product of Array Except Self
- Category: Phase 1: Arrays
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Prefix and Suffix products: calculate left prefix in output, right suffix on return.

**Pitfalls:**
Using division operator (forbidden by problem description).',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-283',
  'dsa',
  'Phase 1: Arrays',
  'LC 283: Move Zeroes',
  'move-zeroes',
  'Easy',
  2,
  'pending',
  1,
  7,
  'https://leetcode.com/problems/move-zeroes/',
  'LeetCode #283 [Easy] in Phase 1: Arrays.',
  'Two pointers: swap non-zero elements to front index.',
  'Creating temporary array instead of in-place mutation.',
  '### LC 283: Move Zeroes
- Category: Phase 1: Arrays
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Two pointers: swap non-zero elements to front index.

**Pitfalls:**
Creating temporary array instead of in-place mutation.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-11',
  'dsa',
  'Phase 1: Two Pointers',
  'LC 11: Container With Most Water',
  'container-with-most-water',
  'Medium',
  1,
  'pending',
  1,
  7,
  'https://leetcode.com/problems/container-with-most-water/',
  'LeetCode #11 [Medium] in Phase 1: Two Pointers.',
  'Converging pointers from both ends; always advance shorter boundary inward.',
  'Advancing taller line cannot increase area constrained by short side.',
  '### LC 11: Container With Most Water
- Category: Phase 1: Two Pointers
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Converging pointers from both ends; always advance shorter boundary inward.

**Pitfalls:**
Advancing taller line cannot increase area constrained by short side.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-15',
  'dsa',
  'Phase 1: Two Pointers',
  'LC 15: 3Sum',
  '3sum',
  'Medium',
  1,
  'pending',
  1,
  8,
  'https://leetcode.com/problems/3sum/',
  'LeetCode #15 [Medium] in Phase 1: Two Pointers.',
  'Sort array first; fix index i, then Two Pointers on remaining sum. Skip duplicates.',
  'Duplicate triplets in result set; not breaking when nums[i] > 0.',
  '### LC 15: 3Sum
- Category: Phase 1: Two Pointers
- Difficulty: Medium
- Time Complexity: O(N^2)
- Space Complexity: O(1)

**Intuition:**
Sort array first; fix index i, then Two Pointers on remaining sum. Skip duplicates.

**Pitfalls:**
Duplicate triplets in result set; not breaking when nums[i] > 0.',
  NULL,
  'O(N^2)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-125',
  'dsa',
  'Phase 1: Two Pointers',
  'LC 125: Valid Palindrome',
  'valid-palindrome',
  'Easy',
  1,
  'pending',
  1,
  9,
  'https://leetcode.com/problems/valid-palindrome/',
  'LeetCode #125 [Easy] in Phase 1: Two Pointers.',
  'Two converging pointers, skip non-alphanumeric chars, compare case-insensitively.',
  'Allocating heavy regex strings in heap.',
  '### LC 125: Valid Palindrome
- Category: Phase 1: Two Pointers
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Two converging pointers, skip non-alphanumeric chars, compare case-insensitively.

**Pitfalls:**
Allocating heavy regex strings in heap.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-167',
  'dsa',
  'Phase 1: Two Pointers',
  'LC 167: Two Sum II - Input Array Is Sorted',
  'two-sum-ii-input-array-is-sorted',
  'Medium',
  1,
  'pending',
  1,
  10,
  'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
  'LeetCode #167 [Medium] in Phase 1: Two Pointers.',
  'Since array is sorted, sum < target -> left++, sum > target -> right--.',
  'Using hash map when sorted property enables O(1) two pointers.',
  '### LC 167: Two Sum II - Input Array Is Sorted
- Category: Phase 1: Two Pointers
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Since array is sorted, sum < target -> left++, sum > target -> right--.

**Pitfalls:**
Using hash map when sorted property enables O(1) two pointers.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-3',
  'dsa',
  'Phase 1: Sliding Window',
  'LC 3: Longest Substring Without Repeating Characters',
  'longest-substring-without-repeating-characters',
  'Medium',
  1,
  'pending',
  1,
  11,
  'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
  'LeetCode #3 [Medium] in Phase 1: Sliding Window.',
  'Sliding window with last-seen character index map. Jump left pointer past duplicate.',
  'Forgetting to check if duplicate index is >= current left pointer.',
  '### LC 3: Longest Substring Without Repeating Characters
- Category: Phase 1: Sliding Window
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(min(N,M))

**Intuition:**
Sliding window with last-seen character index map. Jump left pointer past duplicate.

**Pitfalls:**
Forgetting to check if duplicate index is >= current left pointer.',
  NULL,
  'O(N)',
  'O(min(N,M))',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-209',
  'dsa',
  'Phase 1: Sliding Window',
  'LC 209: Minimum Size Subarray Sum',
  'minimum-size-subarray-sum',
  'Medium',
  2,
  'pending',
  1,
  12,
  'https://leetcode.com/problems/minimum-size-subarray-sum/',
  'LeetCode #209 [Medium] in Phase 1: Sliding Window.',
  'Expand right to reach target sum, then shrink left to find minimal valid length.',
  'Resetting left pointer to 0 instead of sliding window.',
  '### LC 209: Minimum Size Subarray Sum
- Category: Phase 1: Sliding Window
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Expand right to reach target sum, then shrink left to find minimal valid length.

**Pitfalls:**
Resetting left pointer to 0 instead of sliding window.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-424',
  'dsa',
  'Phase 1: Sliding Window',
  'LC 424: Longest Repeating Character Replacement',
  'longest-repeating-character-replacement',
  'Medium',
  1,
  'pending',
  1,
  13,
  'https://leetcode.com/problems/longest-repeating-character-replacement/',
  'LeetCode #424 [Medium] in Phase 1: Sliding Window.',
  'Window condition: (windowLength - maxFreq) <= k. Shrink left if violated.',
  'Recalculating maxFreq on shrink (lazy invariant is fine).',
  '### LC 424: Longest Repeating Character Replacement
- Category: Phase 1: Sliding Window
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Window condition: (windowLength - maxFreq) <= k. Shrink left if violated.

**Pitfalls:**
Recalculating maxFreq on shrink (lazy invariant is fine).',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-567',
  'dsa',
  'Phase 1: Sliding Window',
  'LC 567: Permutation in String',
  'permutation-in-string',
  'Medium',
  2,
  'pending',
  1,
  13,
  'https://leetcode.com/problems/permutation-in-string/',
  'LeetCode #567 [Medium] in Phase 1: Sliding Window.',
  'Fixed sliding window of size s1.Length with character frequency match counter.',
  'Sorting substring at each window step (O(N*K log K) vs O(N) array match).',
  '### LC 567: Permutation in String
- Category: Phase 1: Sliding Window
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Fixed sliding window of size s1.Length with character frequency match counter.

**Pitfalls:**
Sorting substring at each window step (O(N*K log K) vs O(N) array match).',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-643',
  'dsa',
  'Phase 1: Sliding Window',
  'LC 643: Maximum Average Subarray I',
  'maximum-average-subarray-i',
  'Easy',
  3,
  'pending',
  1,
  14,
  'https://leetcode.com/problems/maximum-average-subarray-i/',
  'LeetCode #643 [Easy] in Phase 1: Sliding Window.',
  'Fixed size k window: add nums[i], subtract nums[i-k]. Track max sum.',
  'Integer division truncation when calculating average.',
  '### LC 643: Maximum Average Subarray I
- Category: Phase 1: Sliding Window
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Fixed size k window: add nums[i], subtract nums[i-k]. Track max sum.

**Pitfalls:**
Integer division truncation when calculating average.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-1004',
  'dsa',
  'Phase 1: Sliding Window',
  'LC 1004: Max Consecutive Ones III',
  'max-consecutive-ones-iii',
  'Medium',
  2,
  'pending',
  1,
  15,
  'https://leetcode.com/problems/max-consecutive-ones-iii/',
  'LeetCode #1004 [Medium] in Phase 1: Sliding Window.',
  'At most k zeros in window: expand right, count zeros; shrink left when zeros > k.',
  'Shrinking by more than 1 per step.',
  '### LC 1004: Max Consecutive Ones III
- Category: Phase 1: Sliding Window
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
At most k zeros in window: expand right, count zeros; shrink left when zeros > k.

**Pitfalls:**
Shrinking by more than 1 per step.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-1480',
  'dsa',
  'Phase 1: Prefix Sum',
  'LC 1480: Running Sum of 1d Array',
  'running-sum-of-1d-array',
  'Easy',
  2,
  'pending',
  1,
  16,
  'https://leetcode.com/problems/running-sum-of-1d-array/',
  'LeetCode #1480 [Easy] in Phase 1: Prefix Sum.',
  'Cumulative sum array: nums[i] += nums[i-1].',
  'Off-by-one at index 0.',
  '### LC 1480: Running Sum of 1d Array
- Category: Phase 1: Prefix Sum
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Cumulative sum array: nums[i] += nums[i-1].

**Pitfalls:**
Off-by-one at index 0.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-560',
  'dsa',
  'Phase 1: Prefix Sum',
  'LC 560: Subarray Sum Equals K',
  'subarray-sum-equals-k',
  'Medium',
  1,
  'pending',
  1,
  17,
  'https://leetcode.com/problems/subarray-sum-equals-k/',
  'LeetCode #560 [Medium] in Phase 1: Prefix Sum.',
  'Prefix sum + Hash Map of prefix frequencies! If (currSum - k) in map, add count.',
  'Sliding window fails with negative numbers; hash map of prefix sums is mandatory.',
  '### LC 560: Subarray Sum Equals K
- Category: Phase 1: Prefix Sum
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(N)

**Intuition:**
Prefix sum + Hash Map of prefix frequencies! If (currSum - k) in map, add count.

**Pitfalls:**
Sliding window fails with negative numbers; hash map of prefix sums is mandatory.',
  NULL,
  'O(N)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-724',
  'dsa',
  'Phase 1: Prefix Sum',
  'LC 724: Find Pivot Index',
  'find-pivot-index',
  'Easy',
  2,
  'pending',
  1,
  18,
  'https://leetcode.com/problems/find-pivot-index/',
  'LeetCode #724 [Easy] in Phase 1: Prefix Sum.',
  'Calculate total sum. Left sum == total sum - left sum - nums[i].',
  'Returning last pivot instead of leftmost.',
  '### LC 724: Find Pivot Index
- Category: Phase 1: Prefix Sum
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Calculate total sum. Left sum == total sum - left sum - nums[i].

**Pitfalls:**
Returning last pivot instead of leftmost.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-35',
  'dsa',
  'Phase 1: Binary Search',
  'LC 35: Search Insert Position',
  'search-insert-position',
  'Easy',
  2,
  'pending',
  1,
  19,
  'https://leetcode.com/problems/search-insert-position/',
  'LeetCode #35 [Easy] in Phase 1: Binary Search.',
  'Binary search lower bound: when loop ends (l > r), l is the correct insert position.',
  'Returning r or -1 instead of l.',
  '### LC 35: Search Insert Position
- Category: Phase 1: Binary Search
- Difficulty: Easy
- Time Complexity: O(log N)
- Space Complexity: O(1)

**Intuition:**
Binary search lower bound: when loop ends (l > r), l is the correct insert position.

**Pitfalls:**
Returning r or -1 instead of l.',
  NULL,
  'O(log N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-69',
  'dsa',
  'Phase 1: Binary Search',
  'LC 69: Sqrt(x)',
  'sqrt-x',
  'Easy',
  3,
  'pending',
  1,
  19,
  'https://leetcode.com/problems/sqrt-x/',
  'LeetCode #69 [Easy] in Phase 1: Binary Search.',
  'Binary search in [1, x]. Check if mid * mid <= x (use long to avoid overflow).',
  'Integer overflow on mid * mid without 64-bit cast.',
  '### LC 69: Sqrt(x)
- Category: Phase 1: Binary Search
- Difficulty: Easy
- Time Complexity: O(log N)
- Space Complexity: O(1)

**Intuition:**
Binary search in [1, x]. Check if mid * mid <= x (use long to avoid overflow).

**Pitfalls:**
Integer overflow on mid * mid without 64-bit cast.',
  NULL,
  'O(log N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-278',
  'dsa',
  'Phase 1: Binary Search',
  'LC 278: First Bad Version',
  'first-bad-version',
  'Easy',
  3,
  'pending',
  1,
  20,
  'https://leetcode.com/problems/first-bad-version/',
  'LeetCode #278 [Easy] in Phase 1: Binary Search.',
  'Binary search first true: if isBadVersion(mid), r = mid; else l = mid + 1.',
  'Integer overflow on (l + r) / 2; use l + (r - l) / 2.',
  '### LC 278: First Bad Version
- Category: Phase 1: Binary Search
- Difficulty: Easy
- Time Complexity: O(log N)
- Space Complexity: O(1)

**Intuition:**
Binary search first true: if isBadVersion(mid), r = mid; else l = mid + 1.

**Pitfalls:**
Integer overflow on (l + r) / 2; use l + (r - l) / 2.',
  NULL,
  'O(log N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-704',
  'dsa',
  'Phase 1: Binary Search',
  'LC 704: Binary Search',
  'binary-search',
  'Easy',
  1,
  'pending',
  1,
  21,
  'https://leetcode.com/problems/binary-search/',
  'LeetCode #704 [Easy] in Phase 1: Binary Search.',
  'Canonical while(l <= r) binary search on sorted array.',
  'l <= r vs l < r conditions.',
  '### LC 704: Binary Search
- Category: Phase 1: Binary Search
- Difficulty: Easy
- Time Complexity: O(log N)
- Space Complexity: O(1)

**Intuition:**
Canonical while(l <= r) binary search on sorted array.

**Pitfalls:**
l <= r vs l < r conditions.',
  NULL,
  'O(log N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-875',
  'dsa',
  'Phase 1: Binary Search',
  'LC 875: Koko Eating Bananas',
  'koko-eating-bananas',
  'Medium',
  1,
  'pending',
  1,
  22,
  'https://leetcode.com/problems/koko-eating-bananas/',
  'LeetCode #875 [Medium] in Phase 1: Binary Search.',
  'Binary search on answer space [1, max(piles)] with hours predicate.',
  'Ceiling division: (pile + k - 1) / k.',
  '### LC 875: Koko Eating Bananas
- Category: Phase 1: Binary Search
- Difficulty: Medium
- Time Complexity: O(N log(max))
- Space Complexity: O(1)

**Intuition:**
Binary search on answer space [1, max(piles)] with hours predicate.

**Pitfalls:**
Ceiling division: (pile + k - 1) / k.',
  NULL,
  'O(N log(max))',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-1011',
  'dsa',
  'Phase 1: Binary Search',
  'LC 1011: Capacity To Ship Packages Within D Days',
  'capacity-to-ship-packages-within-d-days',
  'Medium',
  2,
  'pending',
  1,
  23,
  'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/',
  'LeetCode #1011 [Medium] in Phase 1: Binary Search.',
  'Binary search on ship capacity [max(weights), sum(weights)].',
  'Lower bound cannot be less than max single item weight.',
  '### LC 1011: Capacity To Ship Packages Within D Days
- Category: Phase 1: Binary Search
- Difficulty: Medium
- Time Complexity: O(N log(sum))
- Space Complexity: O(1)

**Intuition:**
Binary search on ship capacity [max(weights), sum(weights)].

**Pitfalls:**
Lower bound cannot be less than max single item weight.',
  NULL,
  'O(N log(sum))',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-49',
  'dsa',
  'Phase 1: Hash Map',
  'LC 49: Group Anagrams',
  'group-anagrams',
  'Medium',
  1,
  'pending',
  1,
  24,
  'https://leetcode.com/problems/group-anagrams/',
  'LeetCode #49 [Medium] in Phase 1: Hash Map.',
  'Canonical key: sorted string or character frequency string.',
  'Concatenation collisions.',
  '### LC 49: Group Anagrams
- Category: Phase 1: Hash Map
- Difficulty: Medium
- Time Complexity: O(N*K)
- Space Complexity: O(N*K)

**Intuition:**
Canonical key: sorted string or character frequency string.

**Pitfalls:**
Concatenation collisions.',
  NULL,
  'O(N*K)',
  'O(N*K)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-128',
  'dsa',
  'Phase 1: Hash Map',
  'LC 128: Longest Consecutive Sequence',
  'longest-consecutive-sequence',
  'Medium',
  1,
  'pending',
  1,
  25,
  'https://leetcode.com/problems/longest-consecutive-sequence/',
  'LeetCode #128 [Medium] in Phase 1: Hash Map.',
  'HashSet for O(1) lookup. Only start sequence check if (num - 1) is NOT in set.',
  'Checking sequences starting from middle elements degrades to O(N^2).',
  '### LC 128: Longest Consecutive Sequence
- Category: Phase 1: Hash Map
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(N)

**Intuition:**
HashSet for O(1) lookup. Only start sequence check if (num - 1) is NOT in set.

**Pitfalls:**
Checking sequences starting from middle elements degrades to O(N^2).',
  NULL,
  'O(N)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-217',
  'dsa',
  'Phase 1: Hash Map',
  'LC 217: Contains Duplicate',
  'contains-duplicate',
  'Easy',
  2,
  'pending',
  1,
  25,
  'https://leetcode.com/problems/contains-duplicate/',
  'LeetCode #217 [Easy] in Phase 1: Hash Map.',
  'HashSet.Add() returns false if already present.',
  'Sorting in O(N log N) when HashSet is O(N).',
  '### LC 217: Contains Duplicate
- Category: Phase 1: Hash Map
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(N)

**Intuition:**
HashSet.Add() returns false if already present.

**Pitfalls:**
Sorting in O(N log N) when HashSet is O(N).',
  NULL,
  'O(N)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-242',
  'dsa',
  'Phase 1: Hash Map',
  'LC 242: Valid Anagram',
  'valid-anagram',
  'Easy',
  1,
  'pending',
  1,
  26,
  'https://leetcode.com/problems/valid-anagram/',
  'LeetCode #242 [Easy] in Phase 1: Hash Map.',
  'Fixed array count[26] for frequencies.',
  'Strings of different lengths.',
  '### LC 242: Valid Anagram
- Category: Phase 1: Hash Map
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Fixed array count[26] for frequencies.

**Pitfalls:**
Strings of different lengths.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-347',
  'dsa',
  'Phase 1: Hash Map',
  'LC 347: Top K Frequent Elements',
  'top-k-frequent-elements',
  'Medium',
  1,
  'pending',
  1,
  27,
  'https://leetcode.com/problems/top-k-frequent-elements/',
  'LeetCode #347 [Medium] in Phase 1: Hash Map.',
  'Bucket sort by frequency in O(N) linear time.',
  'Full O(N log N) sort instead of bucket sort or MinHeap.',
  '### LC 347: Top K Frequent Elements
- Category: Phase 1: Hash Map
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(N)

**Intuition:**
Bucket sort by frequency in O(N) linear time.

**Pitfalls:**
Full O(N log N) sort instead of bucket sort or MinHeap.',
  NULL,
  'O(N)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-20',
  'dsa',
  'Phase 1: Stack',
  'LC 20: Valid Parentheses',
  'valid-parentheses',
  'Easy',
  1,
  'pending',
  1,
  28,
  'https://leetcode.com/problems/valid-parentheses/',
  'LeetCode #20 [Easy] in Phase 1: Stack.',
  'LIFO stack: push expected closing bracket; check top equals char.',
  'Empty stack pop; unmatched opening brackets remaining.',
  '### LC 20: Valid Parentheses
- Category: Phase 1: Stack
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(N)

**Intuition:**
LIFO stack: push expected closing bracket; check top equals char.

**Pitfalls:**
Empty stack pop; unmatched opening brackets remaining.',
  NULL,
  'O(N)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-155',
  'dsa',
  'Phase 1: Stack',
  'LC 155: Min Stack',
  'min-stack',
  'Medium',
  1,
  'pending',
  1,
  29,
  'https://leetcode.com/problems/min-stack/',
  'LeetCode #155 [Medium] in Phase 1: Stack.',
  'Parallel minStack or store pair (val, currentMin) on single stack.',
  'Losing minimum history when popping.',
  '### LC 155: Min Stack
- Category: Phase 1: Stack
- Difficulty: Medium
- Time Complexity: O(1)
- Space Complexity: O(N)

**Intuition:**
Parallel minStack or store pair (val, currentMin) on single stack.

**Pitfalls:**
Losing minimum history when popping.',
  NULL,
  'O(1)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-394',
  'dsa',
  'Phase 1: Stack',
  'LC 394: Decode String',
  'decode-string',
  'Medium',
  2,
  'pending',
  1,
  30,
  'https://leetcode.com/problems/decode-string/',
  'LeetCode #394 [Medium] in Phase 1: Stack.',
  'Two stacks: countStack and stringStack for nested brackets.',
  'Multi-digit counts (e.g. 100[a]); nested brackets [2[b]].',
  '### LC 394: Decode String
- Category: Phase 1: Stack
- Difficulty: Medium
- Time Complexity: O(Output)
- Space Complexity: O(Output)

**Intuition:**
Two stacks: countStack and stringStack for nested brackets.

**Pitfalls:**
Multi-digit counts (e.g. 100[a]); nested brackets [2[b]].',
  NULL,
  'O(Output)',
  'O(Output)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-739',
  'dsa',
  'Phase 1: Stack',
  'LC 739: Daily Temperatures',
  'daily-temperatures',
  'Medium',
  1,
  'pending',
  1,
  31,
  'https://leetcode.com/problems/daily-temperatures/',
  'LeetCode #739 [Medium] in Phase 1: Stack.',
  'Monotonic decreasing stack storing indices. Pop colder days when warmer arrives.',
  'Storing temperatures directly instead of indices on stack.',
  '### LC 739: Daily Temperatures
- Category: Phase 1: Stack
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(N)

**Intuition:**
Monotonic decreasing stack storing indices. Pop colder days when warmer arrives.

**Pitfalls:**
Storing temperatures directly instead of indices on stack.',
  NULL,
  'O(N)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-225',
  'dsa',
  'Phase 1: Queue',
  'LC 225: Implement Stack using Queues',
  'implement-stack-using-queues',
  'Easy',
  3,
  'pending',
  1,
  31,
  'https://leetcode.com/problems/implement-stack-using-queues/',
  'LeetCode #225 [Easy] in Phase 1: Queue.',
  'Rotate queue on push: enqueue x, then rotate previous size elements behind it.',
  'O(N) push vs O(N) pop trade-offs.',
  '### LC 225: Implement Stack using Queues
- Category: Phase 1: Queue
- Difficulty: Easy
- Time Complexity: O(N) push, O(1) pop
- Space Complexity: O(N)

**Intuition:**
Rotate queue on push: enqueue x, then rotate previous size elements behind it.

**Pitfalls:**
O(N) push vs O(N) pop trade-offs.',
  NULL,
  'O(N) push, O(1) pop',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-232',
  'dsa',
  'Phase 1: Queue',
  'LC 232: Implement Queue using Stacks',
  'implement-queue-using-stacks',
  'Easy',
  2,
  'pending',
  1,
  32,
  'https://leetcode.com/problems/implement-queue-using-stacks/',
  'LeetCode #232 [Easy] in Phase 1: Queue.',
  'Two stacks: inStack for push, outStack for pop/peek (lazy transfer).',
  'Transferring between stacks on every push instead of amortized pop.',
  '### LC 232: Implement Queue using Stacks
- Category: Phase 1: Queue
- Difficulty: Easy
- Time Complexity: O(1) amortized
- Space Complexity: O(N)

**Intuition:**
Two stacks: inStack for push, outStack for pop/peek (lazy transfer).

**Pitfalls:**
Transferring between stacks on every push instead of amortized pop.',
  NULL,
  'O(1) amortized',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-933',
  'dsa',
  'Phase 1: Queue',
  'LC 933: Number of Recent Calls',
  'number-of-recent-calls',
  'Easy',
  3,
  'pending',
  1,
  33,
  'https://leetcode.com/problems/number-of-recent-calls/',
  'LeetCode #933 [Easy] in Phase 1: Queue.',
  'Queue of timestamps: enqueue ping, dequeue elements older than t - 3000.',
  'Unbounded memory if not dequeuing old requests.',
  '### LC 933: Number of Recent Calls
- Category: Phase 1: Queue
- Difficulty: Easy
- Time Complexity: O(1) amortized
- Space Complexity: O(3000)

**Intuition:**
Queue of timestamps: enqueue ping, dequeue elements older than t - 3000.

**Pitfalls:**
Unbounded memory if not dequeuing old requests.',
  NULL,
  'O(1) amortized',
  'O(3000)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-21',
  'dsa',
  'Phase 2: Linked List',
  'LC 21: Merge Two Sorted Lists',
  'merge-two-sorted-lists',
  'Easy',
  1,
  'pending',
  1,
  34,
  'https://leetcode.com/problems/merge-two-sorted-lists/',
  'LeetCode #21 [Easy] in Phase 2: Linked List.',
  'Dummy head node. Compare list1 and list2 heads, advance smaller pointer.',
  'Null pointer exceptions on exhaustion.',
  '### LC 21: Merge Two Sorted Lists
- Category: Phase 2: Linked List
- Difficulty: Easy
- Time Complexity: O(N+M)
- Space Complexity: O(1)

**Intuition:**
Dummy head node. Compare list1 and list2 heads, advance smaller pointer.

**Pitfalls:**
Null pointer exceptions on exhaustion.',
  NULL,
  'O(N+M)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-141',
  'dsa',
  'Phase 2: Linked List',
  'LC 141: Linked List Cycle',
  'linked-list-cycle',
  'Easy',
  1,
  'pending',
  1,
  35,
  'https://leetcode.com/problems/linked-list-cycle/',
  'LeetCode #141 [Easy] in Phase 2: Linked List.',
  'Floyd''s Tortoise and Hare: slow pointer (1 step), fast pointer (2 steps).',
  'fast == null or fast.next == null boundary check.',
  '### LC 141: Linked List Cycle
- Category: Phase 2: Linked List
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Floyd''s Tortoise and Hare: slow pointer (1 step), fast pointer (2 steps).

**Pitfalls:**
fast == null or fast.next == null boundary check.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-142',
  'dsa',
  'Phase 2: Linked List',
  'LC 142: Linked List Cycle II',
  'linked-list-cycle-ii',
  'Medium',
  2,
  'pending',
  1,
  36,
  'https://leetcode.com/problems/linked-list-cycle-ii/',
  'LeetCode #142 [Medium] in Phase 2: Linked List.',
  'When slow and fast meet, reset slow to head. Advance both 1 step; meeting point is cycle start.',
  'Mathematical distance proof: 2(F+a) = F+nC+a => F = nC-a.',
  '### LC 142: Linked List Cycle II
- Category: Phase 2: Linked List
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
When slow and fast meet, reset slow to head. Advance both 1 step; meeting point is cycle start.

**Pitfalls:**
Mathematical distance proof: 2(F+a) = F+nC+a => F = nC-a.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-160',
  'dsa',
  'Phase 2: Linked List',
  'LC 160: Intersection of Two Linked Lists',
  'intersection-of-two-linked-lists',
  'Easy',
  2,
  'pending',
  1,
  37,
  'https://leetcode.com/problems/intersection-of-two-linked-lists/',
  'LeetCode #160 [Easy] in Phase 2: Linked List.',
  'Two pointers: pointer A jumps to head B at end; pointer B jumps to head A. Meet at intersection.',
  'Modifying list nodes.',
  '### LC 160: Intersection of Two Linked Lists
- Category: Phase 2: Linked List
- Difficulty: Easy
- Time Complexity: O(N+M)
- Space Complexity: O(1)

**Intuition:**
Two pointers: pointer A jumps to head B at end; pointer B jumps to head A. Meet at intersection.

**Pitfalls:**
Modifying list nodes.',
  NULL,
  'O(N+M)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-206',
  'dsa',
  'Phase 2: Linked List',
  'LC 206: Reverse Linked List',
  'reverse-linked-list',
  'Easy',
  1,
  'pending',
  1,
  37,
  'https://leetcode.com/problems/reverse-linked-list/',
  'LeetCode #206 [Easy] in Phase 2: Linked List.',
  'Three pointers: prev, curr, nextTemp. Redirect curr.next = prev in single pass.',
  'Losing rest of list before redirecting pointer.',
  '### LC 206: Reverse Linked List
- Category: Phase 2: Linked List
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Three pointers: prev, curr, nextTemp. Redirect curr.next = prev in single pass.

**Pitfalls:**
Losing rest of list before redirecting pointer.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-234',
  'dsa',
  'Phase 2: Linked List',
  'LC 234: Palindrome Linked List',
  'palindrome-linked-list',
  'Easy',
  2,
  'pending',
  1,
  38,
  'https://leetcode.com/problems/palindrome-linked-list/',
  'LeetCode #234 [Easy] in Phase 2: Linked List.',
  'Find middle (fast/slow), reverse second half, compare halves.',
  'Odd vs even list lengths.',
  '### LC 234: Palindrome Linked List
- Category: Phase 2: Linked List
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Find middle (fast/slow), reverse second half, compare halves.

**Pitfalls:**
Odd vs even list lengths.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-94',
  'dsa',
  'Phase 2: Trees',
  'LC 94: Binary Tree Inorder Traversal',
  'binary-tree-inorder-traversal',
  'Easy',
  1,
  'pending',
  1,
  39,
  'https://leetcode.com/problems/binary-tree-inorder-traversal/',
  'LeetCode #94 [Easy] in Phase 2: Trees.',
  'Left -> Root -> Right. Use stack for iterative traversal or recursion.',
  'Order confusion with preorder / postorder.',
  '### LC 94: Binary Tree Inorder Traversal
- Category: Phase 2: Trees
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(H)

**Intuition:**
Left -> Root -> Right. Use stack for iterative traversal or recursion.

**Pitfalls:**
Order confusion with preorder / postorder.',
  NULL,
  'O(N)',
  'O(H)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-98',
  'dsa',
  'Phase 2: Trees',
  'LC 98: Validate Binary Search Tree',
  'validate-binary-search-tree',
  'Medium',
  1,
  'pending',
  1,
  40,
  'https://leetcode.com/problems/validate-binary-search-tree/',
  'LeetCode #98 [Medium] in Phase 2: Trees.',
  'Every node must satisfy min < val < max. Pass narrowing ranges down DFS.',
  'Only checking immediate left and right children instead of whole subtree.',
  '### LC 98: Validate Binary Search Tree
- Category: Phase 2: Trees
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(H)

**Intuition:**
Every node must satisfy min < val < max. Pass narrowing ranges down DFS.

**Pitfalls:**
Only checking immediate left and right children instead of whole subtree.',
  NULL,
  'O(N)',
  'O(H)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-100',
  'dsa',
  'Phase 2: Trees',
  'LC 100: Same Tree',
  'same-tree',
  'Easy',
  2,
  'pending',
  1,
  41,
  'https://leetcode.com/problems/same-tree/',
  'LeetCode #100 [Easy] in Phase 2: Trees.',
  'Recursive DFS: both null -> true; one null or values differ -> false; recurse left & right.',
  'Null pointer dereference on asymmetric trees.',
  '### LC 100: Same Tree
- Category: Phase 2: Trees
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(H)

**Intuition:**
Recursive DFS: both null -> true; one null or values differ -> false; recurse left & right.

**Pitfalls:**
Null pointer dereference on asymmetric trees.',
  NULL,
  'O(N)',
  'O(H)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-102',
  'dsa',
  'Phase 2: Trees',
  'LC 102: Binary Tree Level Order Traversal',
  'binary-tree-level-order-traversal',
  'Medium',
  1,
  'pending',
  1,
  42,
  'https://leetcode.com/problems/binary-tree-level-order-traversal/',
  'LeetCode #102 [Medium] in Phase 2: Trees.',
  'Queue BFS. Snap levelSize = queue.Count to process each horizontal level in batch.',
  'Using dynamic queue.Count in loop condition.',
  '### LC 102: Binary Tree Level Order Traversal
- Category: Phase 2: Trees
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(N)

**Intuition:**
Queue BFS. Snap levelSize = queue.Count to process each horizontal level in batch.

**Pitfalls:**
Using dynamic queue.Count in loop condition.',
  NULL,
  'O(N)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-104',
  'dsa',
  'Phase 2: Trees',
  'LC 104: Maximum Depth of Binary Tree',
  'maximum-depth-of-binary-tree',
  'Easy',
  1,
  'pending',
  1,
  43,
  'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
  'LeetCode #104 [Easy] in Phase 2: Trees.',
  '1 + Math.Max(MaxDepth(left), MaxDepth(right)). Base case null -> 0.',
  'Stack overflow on degenerate linked-list tree.',
  '### LC 104: Maximum Depth of Binary Tree
- Category: Phase 2: Trees
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(H)

**Intuition:**
1 + Math.Max(MaxDepth(left), MaxDepth(right)). Base case null -> 0.

**Pitfalls:**
Stack overflow on degenerate linked-list tree.',
  NULL,
  'O(N)',
  'O(H)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-110',
  'dsa',
  'Phase 2: Trees',
  'LC 110: Balanced Binary Tree',
  'balanced-binary-tree',
  'Easy',
  2,
  'pending',
  1,
  43,
  'https://leetcode.com/problems/balanced-binary-tree/',
  'LeetCode #110 [Easy] in Phase 2: Trees.',
  'Bottom-up DFS: return -1 immediately if subtree unbalanced, avoiding O(N^2) recalculations.',
  'Top-down approach calculating height at every node is O(N^2).',
  '### LC 110: Balanced Binary Tree
- Category: Phase 2: Trees
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(H)

**Intuition:**
Bottom-up DFS: return -1 immediately if subtree unbalanced, avoiding O(N^2) recalculations.

**Pitfalls:**
Top-down approach calculating height at every node is O(N^2).',
  NULL,
  'O(N)',
  'O(H)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-226',
  'dsa',
  'Phase 2: Trees',
  'LC 226: Invert Binary Tree',
  'invert-binary-tree',
  'Easy',
  1,
  'pending',
  1,
  44,
  'https://leetcode.com/problems/invert-binary-tree/',
  'LeetCode #226 [Easy] in Phase 2: Trees.',
  'Swap left and right children recursively.',
  'Overwriting child before recursion.',
  '### LC 226: Invert Binary Tree
- Category: Phase 2: Trees
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(H)

**Intuition:**
Swap left and right children recursively.

**Pitfalls:**
Overwriting child before recursion.',
  NULL,
  'O(N)',
  'O(H)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-235',
  'dsa',
  'Phase 2: Trees',
  'LC 235: Lowest Common Ancestor of a BST',
  'lowest-common-ancestor-of-a-bst',
  'Medium',
  1,
  'pending',
  1,
  45,
  'https://leetcode.com/problems/lowest-common-ancestor-of-a-bst/',
  'LeetCode #235 [Medium] in Phase 2: Trees.',
  'BST property: if both p & q < root, go left; if both > root, go right; split is LCA!',
  'Treating as generic binary tree when BST property gives O(H) descent.',
  '### LC 235: Lowest Common Ancestor of a BST
- Category: Phase 2: Trees
- Difficulty: Medium
- Time Complexity: O(H)
- Space Complexity: O(1)

**Intuition:**
BST property: if both p & q < root, go left; if both > root, go right; split is LCA!

**Pitfalls:**
Treating as generic binary tree when BST property gives O(H) descent.',
  NULL,
  'O(H)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-236',
  'dsa',
  'Phase 2: Trees',
  'LC 236: Lowest Common Ancestor of a Binary Tree',
  'lowest-common-ancestor-of-a-binary-tree',
  'Medium',
  1,
  'pending',
  1,
  46,
  'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
  'LeetCode #236 [Medium] in Phase 2: Trees.',
  'DFS: if root == p or root == q, return root. If both left and right return non-null, root is LCA.',
  'Assuming BST ordering on non-BST tree.',
  '### LC 236: Lowest Common Ancestor of a Binary Tree
- Category: Phase 2: Trees
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(H)

**Intuition:**
DFS: if root == p or root == q, return root. If both left and right return non-null, root is LCA.

**Pitfalls:**
Assuming BST ordering on non-BST tree.',
  NULL,
  'O(N)',
  'O(H)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-543',
  'dsa',
  'Phase 2: Trees',
  'LC 543: Diameter of Binary Tree',
  'diameter-of-binary-tree',
  'Easy',
  1,
  'pending',
  1,
  47,
  'https://leetcode.com/problems/diameter-of-binary-tree/',
  'LeetCode #543 [Easy] in Phase 2: Trees.',
  'Diameter at node = leftHeight + rightHeight. Track global max during DFS.',
  'Assuming diameter must pass through root.',
  '### LC 543: Diameter of Binary Tree
- Category: Phase 2: Trees
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(H)

**Intuition:**
Diameter at node = leftHeight + rightHeight. Track global max during DFS.

**Pitfalls:**
Assuming diameter must pass through root.',
  NULL,
  'O(N)',
  'O(H)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-215',
  'dsa',
  'Phase 2: Heaps',
  'LC 215: Kth Largest Element in an Array',
  'kth-largest-element-in-an-array',
  'Medium',
  1,
  'pending',
  1,
  48,
  'https://leetcode.com/problems/kth-largest-element-in-an-array/',
  'LeetCode #215 [Medium] in Phase 2: Heaps.',
  'Min-Heap of size k (root holds kth largest) or QuickSelect O(N) partition.',
  'Using Max-Heap storing all N items O(N log N) instead of size K.',
  '### LC 215: Kth Largest Element in an Array
- Category: Phase 2: Heaps
- Difficulty: Medium
- Time Complexity: O(N log K)
- Space Complexity: O(K)

**Intuition:**
Min-Heap of size k (root holds kth largest) or QuickSelect O(N) partition.

**Pitfalls:**
Using Max-Heap storing all N items O(N log N) instead of size K.',
  NULL,
  'O(N log K)',
  'O(K)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-295',
  'dsa',
  'Phase 2: Heaps',
  'LC 295: Find Median from Data Stream',
  'find-median-from-data-stream',
  'Hard',
  1,
  'pending',
  1,
  49,
  'https://leetcode.com/problems/find-median-from-data-stream/',
  'LeetCode #295 [Hard] in Phase 2: Heaps.',
  'Two heaps: MaxHeap for lower half, MinHeap for upper half. Balance sizes within 1.',
  'Heaps getting out of balance or lower half max > upper half min.',
  '### LC 295: Find Median from Data Stream
- Category: Phase 2: Heaps
- Difficulty: Hard
- Time Complexity: O(log N) add, O(1) find
- Space Complexity: O(N)

**Intuition:**
Two heaps: MaxHeap for lower half, MinHeap for upper half. Balance sizes within 1.

**Pitfalls:**
Heaps getting out of balance or lower half max > upper half min.',
  NULL,
  'O(log N) add, O(1) find',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-703',
  'dsa',
  'Phase 2: Heaps',
  'LC 703: Kth Largest Element in a Stream',
  'kth-largest-element-in-a-stream',
  'Easy',
  2,
  'pending',
  1,
  49,
  'https://leetcode.com/problems/kth-largest-element-in-a-stream/',
  'LeetCode #703 [Easy] in Phase 2: Heaps.',
  'Min-Heap of capacity k. When element > peek, replace and heapify.',
  'Heap size growing beyond k.',
  '### LC 703: Kth Largest Element in a Stream
- Category: Phase 2: Heaps
- Difficulty: Easy
- Time Complexity: O(log K)
- Space Complexity: O(K)

**Intuition:**
Min-Heap of capacity k. When element > peek, replace and heapify.

**Pitfalls:**
Heap size growing beyond k.',
  NULL,
  'O(log K)',
  'O(K)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-56',
  'dsa',
  'Phase 2: Intervals',
  'LC 56: Merge Intervals',
  'merge-intervals',
  'Medium',
  1,
  'pending',
  1,
  50,
  'https://leetcode.com/problems/merge-intervals/',
  'LeetCode #56 [Medium] in Phase 2: Intervals.',
  'Sort intervals by start time. If current.start <= prev.end, merge (prev.end = max(prev.end, curr.end)).',
  'Not sorting intervals first.',
  '### LC 56: Merge Intervals
- Category: Phase 2: Intervals
- Difficulty: Medium
- Time Complexity: O(N log N)
- Space Complexity: O(N)

**Intuition:**
Sort intervals by start time. If current.start <= prev.end, merge (prev.end = max(prev.end, curr.end)).

**Pitfalls:**
Not sorting intervals first.',
  NULL,
  'O(N log N)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-57',
  'dsa',
  'Phase 2: Intervals',
  'LC 57: Insert Interval',
  'insert-interval',
  'Medium',
  2,
  'pending',
  1,
  51,
  'https://leetcode.com/problems/insert-interval/',
  'LeetCode #57 [Medium] in Phase 2: Intervals.',
  'Add all intervals before newInterval, merge overlapping intervals, append remaining.',
  'Adding newInterval without merging multi-interval spans.',
  '### LC 57: Insert Interval
- Category: Phase 2: Intervals
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(N)

**Intuition:**
Add all intervals before newInterval, merge overlapping intervals, append remaining.

**Pitfalls:**
Adding newInterval without merging multi-interval spans.',
  NULL,
  'O(N)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-252',
  'dsa',
  'Phase 2: Intervals',
  'LC 252: Meeting Rooms',
  'meeting-rooms',
  'Easy',
  2,
  'pending',
  1,
  52,
  'https://leetcode.com/problems/meeting-rooms/',
  'LeetCode #252 [Easy] in Phase 2: Intervals.',
  'Sort by start time; check if intervals[i].start < intervals[i-1].end.',
  'Intervals not sorted.',
  '### LC 252: Meeting Rooms
- Category: Phase 2: Intervals
- Difficulty: Easy
- Time Complexity: O(N log N)
- Space Complexity: O(1)

**Intuition:**
Sort by start time; check if intervals[i].start < intervals[i-1].end.

**Pitfalls:**
Intervals not sorted.',
  NULL,
  'O(N log N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-253',
  'dsa',
  'Phase 2: Intervals',
  'LC 253: Meeting Rooms II',
  'meeting-rooms-ii',
  'Medium',
  1,
  'pending',
  1,
  53,
  'https://leetcode.com/problems/meeting-rooms-ii/',
  'LeetCode #253 [Medium] in Phase 2: Intervals.',
  'Min-Heap of end times, or two sorted arrays (starts & ends) with two pointers.',
  'Reusing a room when start < end.',
  '### LC 253: Meeting Rooms II
- Category: Phase 2: Intervals
- Difficulty: Medium
- Time Complexity: O(N log N)
- Space Complexity: O(N)

**Intuition:**
Min-Heap of end times, or two sorted arrays (starts & ends) with two pointers.

**Pitfalls:**
Reusing a room when start < end.',
  NULL,
  'O(N log N)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-54',
  'dsa',
  'Phase 2: Matrix',
  'LC 54: Spiral Matrix',
  'spiral-matrix',
  'Medium',
  2,
  'pending',
  1,
  54,
  'https://leetcode.com/problems/spiral-matrix/',
  'LeetCode #54 [Medium] in Phase 2: Matrix.',
  'Maintain 4 boundary pointers (top, bottom, left, right). Walk perimeter and shrink boundaries.',
  'Single row or column matrices causing duplicate traversals.',
  '### LC 54: Spiral Matrix
- Category: Phase 2: Matrix
- Difficulty: Medium
- Time Complexity: O(M*N)
- Space Complexity: O(1)

**Intuition:**
Maintain 4 boundary pointers (top, bottom, left, right). Walk perimeter and shrink boundaries.

**Pitfalls:**
Single row or column matrices causing duplicate traversals.',
  NULL,
  'O(M*N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-73',
  'dsa',
  'Phase 2: Matrix',
  'LC 73: Set Matrix Zeroes',
  'set-matrix-zeroes',
  'Medium',
  2,
  'pending',
  1,
  55,
  'https://leetcode.com/problems/set-matrix-zeroes/',
  'LeetCode #73 [Medium] in Phase 2: Matrix.',
  'Use first row and column as markers to achieve O(1) extra space.',
  'Overwriting marker cells before reading the matrix interior.',
  '### LC 73: Set Matrix Zeroes
- Category: Phase 2: Matrix
- Difficulty: Medium
- Time Complexity: O(M*N)
- Space Complexity: O(1)

**Intuition:**
Use first row and column as markers to achieve O(1) extra space.

**Pitfalls:**
Overwriting marker cells before reading the matrix interior.',
  NULL,
  'O(M*N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-74',
  'dsa',
  'Phase 2: Matrix',
  'LC 74: Search a 2D Matrix',
  'search-a-2d-matrix',
  'Medium',
  1,
  'pending',
  1,
  55,
  'https://leetcode.com/problems/search-a-2d-matrix/',
  'LeetCode #74 [Medium] in Phase 2: Matrix.',
  'Treat m x n matrix as 1D sorted array of size m*n. Binary search with row = mid/n, col = mid%n.',
  'Doing 2 binary searches when single flat index binary search is O(log(M*N)).',
  '### LC 74: Search a 2D Matrix
- Category: Phase 2: Matrix
- Difficulty: Medium
- Time Complexity: O(log(M*N))
- Space Complexity: O(1)

**Intuition:**
Treat m x n matrix as 1D sorted array of size m*n. Binary search with row = mid/n, col = mid%n.

**Pitfalls:**
Doing 2 binary searches when single flat index binary search is O(log(M*N)).',
  NULL,
  'O(log(M*N))',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-79',
  'dsa',
  'Phase 2: Matrix',
  'LC 79: Word Search',
  'word-search',
  'Medium',
  1,
  'pending',
  1,
  56,
  'https://leetcode.com/problems/word-search/',
  'LeetCode #79 [Medium] in Phase 2: Matrix.',
  'Backtracking DFS. Mark visited in-place with dummy char ''#'', restore on backtrack.',
  'Revisiting the same cell within one word path.',
  '### LC 79: Word Search
- Category: Phase 2: Matrix
- Difficulty: Medium
- Time Complexity: O(M*N * 3^L)
- Space Complexity: O(L)

**Intuition:**
Backtracking DFS. Mark visited in-place with dummy char ''#'', restore on backtrack.

**Pitfalls:**
Revisiting the same cell within one word path.',
  NULL,
  'O(M*N * 3^L)',
  'O(L)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-200',
  'dsa',
  'Phase 2: Matrix',
  'LC 200: Number of Islands',
  'number-of-islands',
  'Medium',
  1,
  'pending',
  1,
  57,
  'https://leetcode.com/problems/number-of-islands/',
  'LeetCode #200 [Medium] in Phase 2: Matrix.',
  'Connected components via DFS: sink visited land (''1'' -> ''0'') recursively.',
  'Boundary checks r < 0 || r >= R || c < 0 || c >= C.',
  '### LC 200: Number of Islands
- Category: Phase 2: Matrix
- Difficulty: Medium
- Time Complexity: O(M*N)
- Space Complexity: O(M*N)

**Intuition:**
Connected components via DFS: sink visited land (''1'' -> ''0'') recursively.

**Pitfalls:**
Boundary checks r < 0 || r >= R || c < 0 || c >= C.',
  NULL,
  'O(M*N)',
  'O(M*N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-133',
  'dsa',
  'Phase 3: Graphs & BFS/DFS',
  'LC 133: Clone Graph',
  'clone-graph',
  'Medium',
  1,
  'pending',
  1,
  58,
  'https://leetcode.com/problems/clone-graph/',
  'LeetCode #133 [Medium] in Phase 3: Graphs & BFS/DFS.',
  'DFS/BFS with visited Dictionary<Node, Node> to handle graph cycles.',
  'Infinite recursion on cyclic graphs without visited map.',
  '### LC 133: Clone Graph
- Category: Phase 3: Graphs & BFS/DFS
- Difficulty: Medium
- Time Complexity: O(V+E)
- Space Complexity: O(V)

**Intuition:**
DFS/BFS with visited Dictionary<Node, Node> to handle graph cycles.

**Pitfalls:**
Infinite recursion on cyclic graphs without visited map.',
  NULL,
  'O(V+E)',
  'O(V)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-207',
  'dsa',
  'Phase 3: Topological Sort',
  'LC 207: Course Schedule',
  'course-schedule',
  'Medium',
  1,
  'pending',
  1,
  59,
  'https://leetcode.com/problems/course-schedule/',
  'LeetCode #207 [Medium] in Phase 3: Topological Sort.',
  'Cycle detection via Kahn''s BFS (in-degree array) or 3-state DFS. If cycle exists, cannot finish.',
  'Treating graph as undirected.',
  '### LC 207: Course Schedule
- Category: Phase 3: Topological Sort
- Difficulty: Medium
- Time Complexity: O(V+E)
- Space Complexity: O(V+E)

**Intuition:**
Cycle detection via Kahn''s BFS (in-degree array) or 3-state DFS. If cycle exists, cannot finish.

**Pitfalls:**
Treating graph as undirected.',
  NULL,
  'O(V+E)',
  'O(V+E)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-210',
  'dsa',
  'Phase 3: Topological Sort',
  'LC 210: Course Schedule II',
  'course-schedule-ii',
  'Medium',
  1,
  'pending',
  1,
  60,
  'https://leetcode.com/problems/course-schedule-ii/',
  'LeetCode #210 [Medium] in Phase 3: Topological Sort.',
  'Kahn''s algorithm: enqueue nodes with inDegree == 0. Append to order list as dequeued.',
  'Returning order when cycle prevents full traversal (return empty array).',
  '### LC 210: Course Schedule II
- Category: Phase 3: Topological Sort
- Difficulty: Medium
- Time Complexity: O(V+E)
- Space Complexity: O(V+E)

**Intuition:**
Kahn''s algorithm: enqueue nodes with inDegree == 0. Append to order list as dequeued.

**Pitfalls:**
Returning order when cycle prevents full traversal (return empty array).',
  NULL,
  'O(V+E)',
  'O(V+E)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-417',
  'dsa',
  'Phase 3: Graphs & BFS/DFS',
  'LC 417: Pacific Atlantic Water Flow',
  'pacific-atlantic-water-flow',
  'Medium',
  2,
  'pending',
  1,
  61,
  'https://leetcode.com/problems/pacific-atlantic-water-flow/',
  'LeetCode #417 [Medium] in Phase 3: Graphs & BFS/DFS.',
  'Reverse DFS from ocean borders uphill. Intersect reachable sets.',
  'Simulating water flowing down from every cell is O((M*N)^2).',
  '### LC 417: Pacific Atlantic Water Flow
- Category: Phase 3: Graphs & BFS/DFS
- Difficulty: Medium
- Time Complexity: O(M*N)
- Space Complexity: O(M*N)

**Intuition:**
Reverse DFS from ocean borders uphill. Intersect reachable sets.

**Pitfalls:**
Simulating water flowing down from every cell is O((M*N)^2).',
  NULL,
  'O(M*N)',
  'O(M*N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-547',
  'dsa',
  'Phase 3: Graphs & BFS/DFS',
  'LC 547: Number of Provinces',
  'number-of-provinces',
  'Medium',
  2,
  'pending',
  1,
  61,
  'https://leetcode.com/problems/number-of-provinces/',
  'LeetCode #547 [Medium] in Phase 3: Graphs & BFS/DFS.',
  'Connected components in undirected graph: Union-Find (Disjoint Set) or DFS.',
  'Misreading adjacency matrix dimensions.',
  '### LC 547: Number of Provinces
- Category: Phase 3: Graphs & BFS/DFS
- Difficulty: Medium
- Time Complexity: O(N^2)
- Space Complexity: O(N)

**Intuition:**
Connected components in undirected graph: Union-Find (Disjoint Set) or DFS.

**Pitfalls:**
Misreading adjacency matrix dimensions.',
  NULL,
  'O(N^2)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-994',
  'dsa',
  'Phase 3: Graphs & BFS/DFS',
  'LC 994: Rotting Oranges',
  'rotting-oranges',
  'Medium',
  1,
  'pending',
  1,
  62,
  'https://leetcode.com/problems/rotting-oranges/',
  'LeetCode #994 [Medium] in Phase 3: Graphs & BFS/DFS.',
  'Multi-source BFS from all initially rotten oranges. Track minutes elapsed per level.',
  'Using DFS (shortest time requires multi-source BFS).',
  '### LC 994: Rotting Oranges
- Category: Phase 3: Graphs & BFS/DFS
- Difficulty: Medium
- Time Complexity: O(M*N)
- Space Complexity: O(M*N)

**Intuition:**
Multi-source BFS from all initially rotten oranges. Track minutes elapsed per level.

**Pitfalls:**
Using DFS (shortest time requires multi-source BFS).',
  NULL,
  'O(M*N)',
  'O(M*N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-695',
  'dsa',
  'Phase 3: Graphs & BFS/DFS',
  'LC 695: Max Area of Island',
  'max-area-of-island',
  'Medium',
  2,
  'pending',
  1,
  63,
  'https://leetcode.com/problems/max-area-of-island/',
  'LeetCode #695 [Medium] in Phase 3: Graphs & BFS/DFS.',
  'DFS flood fill returning 1 + area of 4 neighbors, sinking land in-place.',
  'Double counting cells without marking visited.',
  '### LC 695: Max Area of Island
- Category: Phase 3: Graphs & BFS/DFS
- Difficulty: Medium
- Time Complexity: O(M*N)
- Space Complexity: O(M*N)

**Intuition:**
DFS flood fill returning 1 + area of 4 neighbors, sinking land in-place.

**Pitfalls:**
Double counting cells without marking visited.',
  NULL,
  'O(M*N)',
  'O(M*N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-733',
  'dsa',
  'Phase 3: Graphs & BFS/DFS',
  'LC 733: Flood Fill',
  'flood-fill',
  'Easy',
  2,
  'pending',
  1,
  64,
  'https://leetcode.com/problems/flood-fill/',
  'LeetCode #733 [Easy] in Phase 3: Graphs & BFS/DFS.',
  'Standard DFS/BFS starting at (sr, sc). Change matching initial color to newColor.',
  'Infinite loop if newColor == originalColor (return early!).',
  '### LC 733: Flood Fill
- Category: Phase 3: Graphs & BFS/DFS
- Difficulty: Easy
- Time Complexity: O(M*N)
- Space Complexity: O(M*N)

**Intuition:**
Standard DFS/BFS starting at (sr, sc). Change matching initial color to newColor.

**Pitfalls:**
Infinite loop if newColor == originalColor (return early!).',
  NULL,
  'O(M*N)',
  'O(M*N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-208',
  'dsa',
  'Phase 3: Trie',
  'LC 208: Implement Trie (Prefix Tree)',
  'implement-trie-prefix-tree',
  'Medium',
  1,
  'pending',
  1,
  65,
  'https://leetcode.com/problems/implement-trie-prefix-tree/',
  'LeetCode #208 [Medium] in Phase 3: Trie.',
  'Node has Dictionary<char, TrieNode> (or TrieNode[26]) and bool isEnd.',
  'Confusing Search (isEnd must be true) with StartsWith (any prefix matches).',
  '### LC 208: Implement Trie (Prefix Tree)
- Category: Phase 3: Trie
- Difficulty: Medium
- Time Complexity: O(L)
- Space Complexity: O(Total chars)

**Intuition:**
Node has Dictionary<char, TrieNode> (or TrieNode[26]) and bool isEnd.

**Pitfalls:**
Confusing Search (isEnd must be true) with StartsWith (any prefix matches).',
  NULL,
  'O(L)',
  'O(Total chars)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-211',
  'dsa',
  'Phase 3: Trie',
  'LC 211: Design Add and Search Words Data Structure',
  'design-add-and-search-words-data-structure',
  'Medium',
  2,
  'pending',
  1,
  66,
  'https://leetcode.com/problems/design-add-and-search-words-data-structure/',
  'LeetCode #211 [Medium] in Phase 3: Trie.',
  'Trie + DFS for wildcard ''.'' matching all non-null children.',
  'Not handling wildcard recursion branch pruning.',
  '### LC 211: Design Add and Search Words Data Structure
- Category: Phase 3: Trie
- Difficulty: Medium
- Time Complexity: O(M) best, O(26^N) wildcard
- Space Complexity: O(N)

**Intuition:**
Trie + DFS for wildcard ''.'' matching all non-null children.

**Pitfalls:**
Not handling wildcard recursion branch pruning.',
  NULL,
  'O(M) best, O(26^N) wildcard',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-17',
  'dsa',
  'Phase 3: Backtracking',
  'LC 17: Letter Combinations of a Phone Number',
  'letter-combinations-of-a-phone-number',
  'Medium',
  2,
  'pending',
  1,
  67,
  'https://leetcode.com/problems/letter-combinations-of-a-phone-number/',
  'LeetCode #17 [Medium] in Phase 3: Backtracking.',
  'Digit-to-letter map. Recursive backtracking appending one character per digit index.',
  'Empty string input should return empty list.',
  '### LC 17: Letter Combinations of a Phone Number
- Category: Phase 3: Backtracking
- Difficulty: Medium
- Time Complexity: O(4^N)
- Space Complexity: O(N)

**Intuition:**
Digit-to-letter map. Recursive backtracking appending one character per digit index.

**Pitfalls:**
Empty string input should return empty list.',
  NULL,
  'O(4^N)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-39',
  'dsa',
  'Phase 3: Backtracking',
  'LC 39: Combination Sum',
  'combination-sum',
  'Medium',
  1,
  'pending',
  1,
  67,
  'https://leetcode.com/problems/combination-sum/',
  'LeetCode #39 [Medium] in Phase 3: Backtracking.',
  'Backtracking allowing candidate reuse: recurse on same index i; subtract candidate from remain.',
  'Duplicate combinations if not ordering candidate selection.',
  '### LC 39: Combination Sum
- Category: Phase 3: Backtracking
- Difficulty: Medium
- Time Complexity: O(2^target)
- Space Complexity: O(target)

**Intuition:**
Backtracking allowing candidate reuse: recurse on same index i; subtract candidate from remain.

**Pitfalls:**
Duplicate combinations if not ordering candidate selection.',
  NULL,
  'O(2^target)',
  'O(target)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-46',
  'dsa',
  'Phase 3: Backtracking',
  'LC 46: Permutations',
  'permutations',
  'Medium',
  1,
  'pending',
  1,
  68,
  'https://leetcode.com/problems/permutations/',
  'LeetCode #46 [Medium] in Phase 3: Backtracking.',
  'Backtracking with used[i] boolean array or swap in-place.',
  'Adding same reference list to result without new List<int>(path).',
  '### LC 46: Permutations
- Category: Phase 3: Backtracking
- Difficulty: Medium
- Time Complexity: O(N * N!)
- Space Complexity: O(N)

**Intuition:**
Backtracking with used[i] boolean array or swap in-place.

**Pitfalls:**
Adding same reference list to result without new List<int>(path).',
  NULL,
  'O(N * N!)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-78',
  'dsa',
  'Phase 3: Backtracking',
  'LC 78: Subsets',
  'subsets',
  'Medium',
  1,
  'pending',
  1,
  69,
  'https://leetcode.com/problems/subsets/',
  'LeetCode #78 [Medium] in Phase 3: Backtracking.',
  'At each index i, branch: include nums[i] or exclude nums[i] (2^N power set).',
  'Adding mutable list reference instead of snapshot.',
  '### LC 78: Subsets
- Category: Phase 3: Backtracking
- Difficulty: Medium
- Time Complexity: O(N * 2^N)
- Space Complexity: O(N)

**Intuition:**
At each index i, branch: include nums[i] or exclude nums[i] (2^N power set).

**Pitfalls:**
Adding mutable list reference instead of snapshot.',
  NULL,
  'O(N * 2^N)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-90',
  'dsa',
  'Phase 3: Backtracking',
  'LC 90: Subsets II',
  'subsets-ii',
  'Medium',
  2,
  'pending',
  1,
  70,
  'https://leetcode.com/problems/subsets-ii/',
  'LeetCode #90 [Medium] in Phase 3: Backtracking.',
  'Sort array first. In for-loop, skip if (i > start && nums[i] == nums[i-1]) to avoid duplicate subsets.',
  'Skipping duplicates across different recursion depths.',
  '### LC 90: Subsets II
- Category: Phase 3: Backtracking
- Difficulty: Medium
- Time Complexity: O(N * 2^N)
- Space Complexity: O(N)

**Intuition:**
Sort array first. In for-loop, skip if (i > start && nums[i] == nums[i-1]) to avoid duplicate subsets.

**Pitfalls:**
Skipping duplicates across different recursion depths.',
  NULL,
  'O(N * 2^N)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-70',
  'dsa',
  'Phase 4: Dynamic Programming',
  'LC 70: Climbing Stairs',
  'climbing-stairs',
  'Easy',
  1,
  'pending',
  1,
  71,
  'https://leetcode.com/problems/climbing-stairs/',
  'LeetCode #70 [Easy] in Phase 4: Dynamic Programming.',
  'Fibonacci: dp[i] = dp[i-1] + dp[i-2]. O(1) state memory.',
  'O(2^N) recursion without memoization.',
  '### LC 70: Climbing Stairs
- Category: Phase 4: Dynamic Programming
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Fibonacci: dp[i] = dp[i-1] + dp[i-2]. O(1) state memory.

**Pitfalls:**
O(2^N) recursion without memoization.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-509',
  'dsa',
  'Phase 4: Dynamic Programming',
  'LC 509: Fibonacci Number',
  'fibonacci-number',
  'Easy',
  2,
  'pending',
  1,
  72,
  'https://leetcode.com/problems/fibonacci-number/',
  'LeetCode #509 [Easy] in Phase 4: Dynamic Programming.',
  'Iterative two-variable tabulation.',
  'Recursion tree without memo.',
  '### LC 509: Fibonacci Number
- Category: Phase 4: Dynamic Programming
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Iterative two-variable tabulation.

**Pitfalls:**
Recursion tree without memo.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-746',
  'dsa',
  'Phase 4: Dynamic Programming',
  'LC 746: Min Cost Climbing Stairs',
  'min-cost-climbing-stairs',
  'Easy',
  2,
  'pending',
  1,
  73,
  'https://leetcode.com/problems/min-cost-climbing-stairs/',
  'LeetCode #746 [Easy] in Phase 4: Dynamic Programming.',
  'dp[i] = cost[i] + Math.Min(dp[i-1], dp[i-2]).',
  'Can start at index 0 or index 1.',
  '### LC 746: Min Cost Climbing Stairs
- Category: Phase 4: Dynamic Programming
- Difficulty: Easy
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
dp[i] = cost[i] + Math.Min(dp[i-1], dp[i-2]).

**Pitfalls:**
Can start at index 0 or index 1.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-198',
  'dsa',
  'Phase 4: Dynamic Programming',
  'LC 198: House Robber',
  'house-robber',
  'Medium',
  1,
  'pending',
  1,
  73,
  'https://leetcode.com/problems/house-robber/',
  'LeetCode #198 [Medium] in Phase 4: Dynamic Programming.',
  'dp[i] = Math.Max(dp[i-1], dp[i-2] + nums[i]). Maintain rob1 and rob2.',
  'Trying greedy (picking largest values fails on adjacent neighbors).',
  '### LC 198: House Robber
- Category: Phase 4: Dynamic Programming
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
dp[i] = Math.Max(dp[i-1], dp[i-2] + nums[i]). Maintain rob1 and rob2.

**Pitfalls:**
Trying greedy (picking largest values fails on adjacent neighbors).',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-213',
  'dsa',
  'Phase 4: Dynamic Programming',
  'LC 213: House Robber II',
  'house-robber-ii',
  'Medium',
  2,
  'pending',
  1,
  74,
  'https://leetcode.com/problems/house-robber-ii/',
  'LeetCode #213 [Medium] in Phase 4: Dynamic Programming.',
  'Houses in circle: run House Robber on [0..n-2] and [1..n-1]. Take max.',
  'Not handling single house edge case.',
  '### LC 213: House Robber II
- Category: Phase 4: Dynamic Programming
- Difficulty: Medium
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Houses in circle: run House Robber on [0..n-2] and [1..n-1]. Take max.

**Pitfalls:**
Not handling single house edge case.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-322',
  'dsa',
  'Phase 4: Dynamic Programming',
  'LC 322: Coin Change',
  'coin-change',
  'Medium',
  1,
  'pending',
  1,
  75,
  'https://leetcode.com/problems/coin-change/',
  'LeetCode #322 [Medium] in Phase 4: Dynamic Programming.',
  'Unbounded knapsack: dp[a] = min(dp[a], 1 + dp[a - coin]).',
  'Greedy approach fails on arbitrary denominations.',
  '### LC 322: Coin Change
- Category: Phase 4: Dynamic Programming
- Difficulty: Medium
- Time Complexity: O(Amount * N)
- Space Complexity: O(Amount)

**Intuition:**
Unbounded knapsack: dp[a] = min(dp[a], 1 + dp[a - coin]).

**Pitfalls:**
Greedy approach fails on arbitrary denominations.',
  NULL,
  'O(Amount * N)',
  'O(Amount)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-300',
  'dsa',
  'Phase 4: Dynamic Programming',
  'LC 300: Longest Increasing Subsequence',
  'longest-increasing-subsequence',
  'Medium',
  1,
  'pending',
  1,
  76,
  'https://leetcode.com/problems/longest-increasing-subsequence/',
  'LeetCode #300 [Medium] in Phase 4: Dynamic Programming.',
  'Patience sorting / Binary search tail array in O(N log N).',
  'O(N^2) DP is accepted but sub-optimal compared to O(N log N) tails.',
  '### LC 300: Longest Increasing Subsequence
- Category: Phase 4: Dynamic Programming
- Difficulty: Medium
- Time Complexity: O(N log N)
- Space Complexity: O(N)

**Intuition:**
Patience sorting / Binary search tail array in O(N log N).

**Pitfalls:**
O(N^2) DP is accepted but sub-optimal compared to O(N log N) tails.',
  NULL,
  'O(N log N)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-416',
  'dsa',
  'Phase 4: Dynamic Programming',
  'LC 416: Partition Equal Subset Sum',
  'partition-equal-subset-sum',
  'Medium',
  1,
  'pending',
  1,
  77,
  'https://leetcode.com/problems/partition-equal-subset-sum/',
  'LeetCode #416 [Medium] in Phase 4: Dynamic Programming.',
  '0/1 Knapsack: can subset sum equal totalSum / 2? If odd total, impossible.',
  'Inner loop must run backwards to avoid using same element twice in 1D DP.',
  '### LC 416: Partition Equal Subset Sum
- Category: Phase 4: Dynamic Programming
- Difficulty: Medium
- Time Complexity: O(N * Target)
- Space Complexity: O(Target)

**Intuition:**
0/1 Knapsack: can subset sum equal totalSum / 2? If odd total, impossible.

**Pitfalls:**
Inner loop must run backwards to avoid using same element twice in 1D DP.',
  NULL,
  'O(N * Target)',
  'O(Target)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-1143',
  'dsa',
  'Phase 4: Dynamic Programming',
  'LC 1143: Longest Common Subsequence',
  'longest-common-subsequence',
  'Medium',
  1,
  'pending',
  1,
  78,
  'https://leetcode.com/problems/longest-common-subsequence/',
  'LeetCode #1143 [Medium] in Phase 4: Dynamic Programming.',
  '2D DP: if s1[i] == s2[j], 1 + dp[i-1, j-1]; else max(dp[i-1, j], dp[i, j-1]).',
  'Off-by-one with (M+1) x (N+1) DP grid.',
  '### LC 1143: Longest Common Subsequence
- Category: Phase 4: Dynamic Programming
- Difficulty: Medium
- Time Complexity: O(M*N)
- Space Complexity: O(M*N)

**Intuition:**
2D DP: if s1[i] == s2[j], 1 + dp[i-1, j-1]; else max(dp[i-1, j], dp[i, j-1]).

**Pitfalls:**
Off-by-one with (M+1) x (N+1) DP grid.',
  NULL,
  'O(M*N)',
  'O(M*N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-72',
  'dsa',
  'Phase 4: Dynamic Programming',
  'LC 72: Edit Distance',
  'edit-distance',
  'Medium',
  1,
  'pending',
  1,
  79,
  'https://leetcode.com/problems/edit-distance/',
  'LeetCode #72 [Medium] in Phase 4: Dynamic Programming.',
  'Levenshtein distance: insert, delete, replace. dp[i, j] = 1 + min(insert, delete, replace).',
  'Base cases when one string is empty (costs equal remaining length).',
  '### LC 72: Edit Distance
- Category: Phase 4: Dynamic Programming
- Difficulty: Medium
- Time Complexity: O(M*N)
- Space Complexity: O(M*N)

**Intuition:**
Levenshtein distance: insert, delete, replace. dp[i, j] = 1 + min(insert, delete, replace).

**Pitfalls:**
Base cases when one string is empty (costs equal remaining length).',
  NULL,
  'O(M*N)',
  'O(M*N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-42',
  'dsa',
  'Phase 5: Hard Questions',
  'LC 42: Trapping Rain Water',
  'trapping-rain-water',
  'Hard',
  1,
  'pending',
  1,
  79,
  'https://leetcode.com/problems/trapping-rain-water/',
  'LeetCode #42 [Hard] in Phase 5: Hard Questions.',
  'Two pointers with leftMax & rightMax. Bottleneck on shorter side determines water trapped.',
  'Updating max values after adding water instead of before.',
  '### LC 42: Trapping Rain Water
- Category: Phase 5: Hard Questions
- Difficulty: Hard
- Time Complexity: O(N)
- Space Complexity: O(1)

**Intuition:**
Two pointers with leftMax & rightMax. Bottleneck on shorter side determines water trapped.

**Pitfalls:**
Updating max values after adding water instead of before.',
  NULL,
  'O(N)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-76',
  'dsa',
  'Phase 5: Hard Questions',
  'LC 76: Minimum Window Substring',
  'minimum-window-substring',
  'Hard',
  1,
  'pending',
  1,
  80,
  'https://leetcode.com/problems/minimum-window-substring/',
  'LeetCode #76 [Hard] in Phase 5: Hard Questions.',
  'Sliding window with have and need counters. Expand right, shrink left to minimize.',
  'Character frequencies > 1; unicode edge cases.',
  '### LC 76: Minimum Window Substring
- Category: Phase 5: Hard Questions
- Difficulty: Hard
- Time Complexity: O(N+M)
- Space Complexity: O(N+M)

**Intuition:**
Sliding window with have and need counters. Expand right, shrink left to minimize.

**Pitfalls:**
Character frequencies > 1; unicode edge cases.',
  NULL,
  'O(N+M)',
  'O(N+M)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-84',
  'dsa',
  'Phase 5: Hard Questions',
  'LC 84: Largest Rectangle in Histogram',
  'largest-rectangle-in-histogram',
  'Hard',
  1,
  'pending',
  1,
  81,
  'https://leetcode.com/problems/largest-rectangle-in-histogram/',
  'LeetCode #84 [Hard] in Phase 5: Hard Questions.',
  'Monotonic increasing stack of indices. On shorter bar, pop and calculate area with popped height.',
  'Width calculation: i - stack.Peek() - 1.',
  '### LC 84: Largest Rectangle in Histogram
- Category: Phase 5: Hard Questions
- Difficulty: Hard
- Time Complexity: O(N)
- Space Complexity: O(N)

**Intuition:**
Monotonic increasing stack of indices. On shorter bar, pop and calculate area with popped height.

**Pitfalls:**
Width calculation: i - stack.Peek() - 1.',
  NULL,
  'O(N)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-127',
  'dsa',
  'Phase 5: Hard Questions',
  'LC 127: Word Ladder',
  'word-ladder',
  'Hard',
  2,
  'pending',
  1,
  82,
  'https://leetcode.com/problems/word-ladder/',
  'LeetCode #127 [Hard] in Phase 5: Hard Questions.',
  'Bidirectional BFS from beginWord and endWord changing one character at a time.',
  'Single-direction BFS exploring massive branching factors.',
  '### LC 127: Word Ladder
- Category: Phase 5: Hard Questions
- Difficulty: Hard
- Time Complexity: O(N * M^2)
- Space Complexity: O(N * M)

**Intuition:**
Bidirectional BFS from beginWord and endWord changing one character at a time.

**Pitfalls:**
Single-direction BFS exploring massive branching factors.',
  NULL,
  'O(N * M^2)',
  'O(N * M)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-10',
  'dsa',
  'Phase 5: Hard Questions',
  'LC 10: Regular Expression Matching',
  'regular-expression-matching',
  'Hard',
  3,
  'pending',
  1,
  83,
  'https://leetcode.com/problems/regular-expression-matching/',
  'LeetCode #10 [Hard] in Phase 5: Hard Questions.',
  'DP table matching ''.'' and ''*''. If ''*'' matches zero or more occurrences.',
  'Empty string matching a*b* patterns.',
  '### LC 10: Regular Expression Matching
- Category: Phase 5: Hard Questions
- Difficulty: Hard
- Time Complexity: O(M*N)
- Space Complexity: O(M*N)

**Intuition:**
DP table matching ''.'' and ''*''. If ''*'' matches zero or more occurrences.

**Pitfalls:**
Empty string matching a*b* patterns.',
  NULL,
  'O(M*N)',
  'O(M*N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-32',
  'dsa',
  'Phase 5: Hard Questions',
  'LC 32: Longest Valid Parentheses',
  'longest-valid-parentheses',
  'Hard',
  3,
  'pending',
  1,
  84,
  'https://leetcode.com/problems/longest-valid-parentheses/',
  'LeetCode #32 [Hard] in Phase 5: Hard Questions.',
  'Stack storing indices, initialized with -1 as base for length calculation.',
  'Matching count without boundary index baseline.',
  '### LC 32: Longest Valid Parentheses
- Category: Phase 5: Hard Questions
- Difficulty: Hard
- Time Complexity: O(N)
- Space Complexity: O(N)

**Intuition:**
Stack storing indices, initialized with -1 as base for length calculation.

**Pitfalls:**
Matching count without boundary index baseline.',
  NULL,
  'O(N)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'dsa-lc-312',
  'dsa',
  'Phase 5: Hard Questions',
  'LC 312: Burst Balloons',
  'burst-balloons',
  'Hard',
  3,
  'pending',
  1,
  85,
  'https://leetcode.com/problems/burst-balloons/',
  'LeetCode #312 [Hard] in Phase 5: Hard Questions.',
  'Interval DP backwards: which balloon is popped LAST in interval [l, r]?',
  'Top-down thinking which balloon popped first creates subproblems that depend on external neighbors.',
  '### LC 312: Burst Balloons
- Category: Phase 5: Hard Questions
- Difficulty: Hard
- Time Complexity: O(N^3)
- Space Complexity: O(N^2)

**Intuition:**
Interval DP backwards: which balloon is popped LAST in interval [l, r]?

**Pitfalls:**
Top-down thinking which balloon popped first creates subproblems that depend on external neighbors.',
  NULL,
  'O(N^3)',
  'O(N^2)',
  1,
  NOW(),
  NOW()
),
(
  'sys-scaling-fundamentals',
  'system_design',
  '1. Architecture Fundamentals',
  'Vertical vs Horizontal Scaling & Bottlenecks',
  'scaling-fundamentals',
  'Easy',
  2,
  'pending',
  1,
  4,
  NULL,
  'Hardware limits vs commodity clustering, stateless web tiers, and DB read/write scaling.',
  'Vertical has hardware ceilings and SPOF. Horizontal requires stateless web services, LBs, and partitioned databases.',
  'Treating DBs as horizontally scalable without planning for replication lag and distributed transactions.',
  '### Horizontal Scaling Architecture
- Stateless web services behind LBs
- DB read replicas for read-heavy workloads
- Partitioning / Sharding for write scaling
- Distributed Redis sessions',
  NULL,
  'N/A',
  'N/A',
  1,
  NOW(),
  NOW()
),
(
  'sys-load-balancing',
  'system_design',
  '1. Architecture Fundamentals',
  'Load Balancers & Algorithms (L4 vs L7, NGINX, HAProxy, Envoy)',
  'load-balancing-algorithms',
  'Medium',
  2,
  'pending',
  1,
  7,
  NULL,
  'Transport (L4 TCP/UDP) vs Application (L7 HTTP/Headers) routing algorithms and health checking.',
  'L4 routes on IP & Port (fast, low CPU). L7 inspects HTTP headers, path, cookies (smart routing, TLS termination, microservice path routing).',
  'Sticky sessions causing uneven traffic hotspotting; unmonitored unhealthy nodes receiving traffic.',
  '### Key Algorithms
- Round Robin, Weighted Round Robin
- Least Connections
- Consistent Hashing
- Active vs Passive Health Checks',
  NULL,
  'O(1)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'sys-consistent-hashing',
  'system_design',
  '1. Architecture Fundamentals',
  'Consistent Hashing & Virtual Nodes',
  'consistent-hashing',
  'Medium',
  2,
  'pending',
  1,
  11,
  NULL,
  'Partitioning data across distributed nodes such that node scaling only reshuffles k/N keys.',
  'Hash ring [0, 2^32 - 1]. Virtual nodes (100-200 per physical host) eliminate non-uniform distribution and hotspots.',
  'Standard hash % N remaps 100% of keys on scale event, causing cache stampedes.',
  '### Consistent Hashing Ring
- Add node: only steals keys from clockwise neighbor.
- Virtual nodes smooth distribution variance across servers.',
  NULL,
  'O(log N)',
  'O(N)',
  1,
  NOW(),
  NOW()
),
(
  'sys-caching-strategies',
  'system_design',
  '1. Architecture Fundamentals',
  'Caching Strategies & Eviction (Cache-Aside, Write-Back, Stampede)',
  'caching-strategies-and-eviction',
  'Medium',
  2,
  'pending',
  1,
  15,
  NULL,
  'Cache-Aside, Write-Through, Write-Behind, Refresh-Ahead patterns with LRU/LFU eviction and stampede mitigation.',
  'Cache-Aside is resilient to cache crashes. Write-Behind batches DB writes for lowest write latency, but risks data loss on cache crash. Thundering herd prevented with mutex locks.',
  'Cache Stampede / Thundering Herd when hot key expires; omitting TTL causing memory leaks.',
  '### Caching Patterns Table
1. Cache-Aside (Standard)
2. Write-Through
3. Write-Behind (Batched)
4. Eviction: LRU, LFU, TTL',
  NULL,
  'O(1)',
  'O(Cache Size)',
  1,
  NOW(),
  NOW()
),
(
  'sys-cap-theorem-pacelc',
  'system_design',
  '1. Architecture Fundamentals',
  'CAP Theorem & PACELC Trade-offs (Consistency Models)',
  'cap-theorem-and-pacelc',
  'Medium',
  2,
  'pending',
  1,
  19,
  NULL,
  'Constraints between Consistency, Availability, and Partition Tolerance in distributed networks.',
  'Partitions (P) are inevitable in distributed WANs. Under partition: choose Consistency (CP) or Availability (AP). PACELC: Else Latency or Consistency.',
  'Claiming a distributed WAN system is CA (CA only exists in single-node/single-datacenter contexts).',
  '### PACELC Framework
- If Partition (P): Availability (A) vs Consistency (C)
- Else (E): Latency (L) vs Consistency (C)',
  NULL,
  'N/A',
  'N/A',
  1,
  NOW(),
  NOW()
),
(
  'sys-database-sharding',
  'system_design',
  '1. Architecture Fundamentals',
  'Database Sharding & Partitioning Strategies (Range, Hash, Directory)',
  'database-sharding-strategies',
  'Hard',
  2,
  'pending',
  1,
  23,
  NULL,
  'Horizontal partitioning of database records across multiple database instances, resharding, and routing.',
  'Choose Shard Key carefully! Must distribute read/write traffic evenly without cross-shard joins. Strategies: Hash, Range, Directory.',
  'Celebrity/Hotspot problem where one key gets 90% of traffic; cross-shard distributed transactions.',
  '### Sharding Trade-offs
- High write scalability
- Cross-shard queries require scatter-gather (slow)
- Resharding requires zero-downtime dual-writes',
  NULL,
  'O(1) with shard key',
  'N/A',
  1,
  NOW(),
  NOW()
),
(
  'sys-sql-vs-nosql',
  'system_design',
  '1. Architecture Fundamentals',
  'Relational (ACID) vs NoSQL (Document, Key-Value, Wide-Column, Graph)',
  'sql-vs-nosql-databases',
  'Medium',
  2,
  'pending',
  1,
  27,
  NULL,
  'Structural tradeoffs: relational normalization and ACID guarantees vs document flexibility, key-value speed, and wide-column analytics.',
  'RDBMS for strict transactional integrity and relational queries. Key-Value (Redis) for microsecond lookups. Document (MongoDB) for nested JSON. Wide-Column (Cassandra) for write-heavy time-series.',
  'Choosing NoSQL just for hype, then manually implementing joins and two-phase commits in application code.',
  '### Database Selection Guide
- Relational: Financial, inventory, strict ACID
- Document: User profiles, content catalogs
- Wide-Column: IoT telemetry, chat histories, analytics
- Graph: Social networks, fraud detection',
  NULL,
  'Varies',
  'Varies',
  1,
  NOW(),
  NOW()
),
(
  'sys-message-queues-event-streaming',
  'system_design',
  '1. Architecture Fundamentals',
  'Message Queues & Event Streaming (Kafka vs RabbitMQ vs SQS)',
  'message-queues-event-streaming',
  'Hard',
  2,
  'pending',
  1,
  31,
  NULL,
  'Message brokers vs distributed commit logs: push vs pull models, ordering guarantees, consumer groups, and backpressure.',
  'RabbitMQ is a smart broker/dumb consumer (routing keys, transient queues, push). Kafka is a dumb broker/smart consumer (append-only disk log, partition ordering, replayability, pull).',
  'Using Kafka as a transient task queue with thousands of short-lived topics, or RabbitMQ as a permanent historical audit log.',
  '### Broker vs Log
- RabbitMQ: Complex routing, transient task workers, per-message ACK.
- Kafka: High throughput (millions/sec), partitioned log, offset tracking, replayable.',
  NULL,
  'O(1) append',
  'O(Retention)',
  1,
  NOW(),
  NOW()
),
(
  'sys-distributed-transactions-saga',
  'system_design',
  '1. Architecture Fundamentals',
  'Distributed Transactions & The Saga Pattern (Orchestration vs Choreography)',
  'distributed-transactions-saga-pattern',
  'Hard',
  2,
  'pending',
  1,
  35,
  NULL,
  'Overcoming lack of 2-Phase Commit (2PC) across microservices using Sagas, compensating transactions, and the Outbox Pattern.',
  '2PC is blocking and fragile. Saga executes sequential local transactions with compensating rollbacks on failure. Choreography (events) for simple flows; Orchestration for complex workflows.',
  'Dual-write bug: writing to database and publishing to message broker without the Transactional Outbox pattern.',
  '### Transactional Outbox Pattern
1. Write business entity AND outbox message in same local DB transaction.
2. Debezium / Background worker polls outbox and publishes to broker.
3. Guarantees at-least-once message delivery!',
  NULL,
  'N/A',
  'N/A',
  1,
  NOW(),
  NOW()
),
(
  'sys-replication-quorum',
  'system_design',
  '1. Architecture Fundamentals',
  'Database Replication, Quorum & Replication Lag (Sync vs Async)',
  'database-replication-quorum-lag',
  'Medium',
  2,
  'pending',
  1,
  39,
  NULL,
  'Single-leader, multi-leader, and leaderless replication, read-after-write consistency, and quorum math.',
  'Synchronous replication guarantees zero data loss (RPO=0) but spikes latency. Asynchronous is fast but risks data loss on failover. Quorum R + W > N guarantees reading the latest write.',
  'Split-brain in leader elections during network partitions; users reading stale data immediately after updating their profile (fix with read-after-write routing).',
  '### Quorum Equation
- N = Replicas (e.g. 3)
- W = Write quorum (e.g. 2)
- R = Read quorum (e.g. 2)
- R + W > N ensures at least one node has latest version timestamp.',
  NULL,
  'N/A',
  'N/A',
  1,
  NOW(),
  NOW()
),
(
  'sys-api-protocols-serialization',
  'system_design',
  '1. Architecture Fundamentals',
  'API Protocols & Data Serialization (REST, gRPC, GraphQL, WebSockets)',
  'api-protocols-serialization-grpc-rest',
  'Medium',
  2,
  'pending',
  1,
  43,
  NULL,
  'Comparing communication protocols: text JSON vs binary Protobuf, client-driven schemas vs server contracts, and streaming.',
  'REST for public developer APIs. gRPC (HTTP/2 + Protobuf) for low-latency internal microservices. GraphQL for mobile aggregators avoiding over-fetching. WebSockets for bidirectional real-time feeds.',
  'Using GraphQL internally between microservices creating N+1 query waterfalls; using WebSockets when unidirectional SSE suffices.',
  '### Protocol Trade-offs
- REST: Human-readable, ubiquitous, stateless.
- gRPC: 7-10x smaller payload, multiplexed HTTP/2, contract-first.
- WebSockets: Persistent full-duplex TCP connection.',
  NULL,
  'N/A',
  'N/A',
  1,
  NOW(),
  NOW()
),
(
  'sys-distributed-id-generation',
  'system_design',
  '1. Architecture Fundamentals',
  'Distributed Unique ID Generation (Snowflake, ULID, UUIDv7)',
  'distributed-id-generation-snowflake',
  'Medium',
  2,
  'pending',
  1,
  46,
  NULL,
  'Generating 64-bit and 128-bit globally unique, time-sortable IDs at scale without central database bottlenecks.',
  'Twitter Snowflake generates 64-bit IDs (41b timestamp, 10b worker ID, 12b sequence) sortable by time. UUIDv4 destroys B-tree index locality; UUIDv7 / ULID use timestamp prefixes to maintain B-tree performance.',
  'Clock drift / NTP backwards adjustments causing duplicate IDs in Snowflake; using random UUIDv4 as primary keys on high-volume MySQL/Postgres tables.',
  '### Snowflake Bit Layout (64-bit)
- 1 bit: Unused (sign bit)
- 41 bits: Epoch milliseconds (~69 years)
- 10 bits: Machine / Node ID (1024 nodes)
- 12 bits: Sequence counter (4096 IDs per ms per node)',
  NULL,
  'O(1)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'sys-design-tinyurl',
  'system_design',
  '2. Case Studies',
  'Design a URL Shortener (TinyURL / Bitly)',
  'design-tinyurl',
  'Medium',
  2,
  'pending',
  1,
  49,
  NULL,
  'High availability read-heavy short URL generation and redirect service handling billions of links.',
  'Base62 encoding of 64-bit unique ID (Snowflake). 7 chars = 62^7 ≈ 3.5T URLs. 301 vs 302 redirect (302 enables analytics tracking). Redis cache for hot redirects.',
  'MD5/SHA256 hash collision truncation; using 301 permanent redirect when click tracking is required.',
  '### TinyURL Architecture
- Reads: Redis cache, 302 redirect.
- Writes: Unique ID Generator -> Base62 -> DB record.
- Scalability: 100:1 Read-to-Write ratio.',
  NULL,
  'O(1)',
  'O(Total URLs)',
  1,
  NOW(),
  NOW()
),
(
  'sys-design-rate-limiter',
  'system_design',
  '2. Case Studies',
  'Design a Distributed Rate Limiter',
  'design-distributed-rate-limiter',
  'Medium',
  2,
  'pending',
  1,
  52,
  NULL,
  'Scalable multi-tier rate limiting service protecting internal microservices from DDoS and abuse.',
  'API Gateway middleware + Redis sliding window counter with atomic Lua script. HTTP 429 Too Many Requests + Retry-After header.',
  'Single Redis instance failure blocking all traffic (fail-open vs fail-close trade-off); race conditions without Lua atomicity.',
  '### Rate Limiter Blueprint
- Token bucket in-memory buffer with periodic sync to Redis.
- Partitioned by API Key or IP address.
- Fallback to local token bucket if Redis is unreachable.',
  NULL,
  'O(1)',
  'O(Active Users)',
  1,
  NOW(),
  NOW()
),
(
  'sys-design-chat-system',
  'system_design',
  '2. Case Studies',
  'Design a Real-Time Chat System (WhatsApp / Slack)',
  'design-real-time-chat-system',
  'Hard',
  2,
  'pending',
  1,
  55,
  NULL,
  'Real-time messaging architecture with 1-on-1 and group chats, presence detection, and durable message persistence.',
  'Persistent WebSockets on Chat Gateway servers. Redis PubSub for presence & ephemeral routing. Cassandra partitioned by chat_id for fast sequential timeline queries.',
  'Storing chat messages in relational DB with unbounded foreign keys; group fanout overhead for massive channels.',
  '### Chat Architecture
- WebSocket connection servers
- Cassandra: Partition key = chat_id, Clustering key = message_id.
- Presence service with 30s heartbeat.',
  NULL,
  'O(1) send/receive',
  'O(Messages)',
  1,
  NOW(),
  NOW()
),
(
  'sys-design-video-streaming',
  'system_design',
  '2. Case Studies',
  'Design a Video Streaming Platform (YouTube / Netflix)',
  'design-video-streaming-platform',
  'Hard',
  2,
  'pending',
  1,
  58,
  NULL,
  'Video ingestion, transcoding DAG, adaptive bitrate packaging, and global CDN delivery pipeline for millions of concurrent viewers.',
  'Adaptive bitrate streaming (HLS/DASH) chunks (1080p, 720p, 480p). Storage on S3 + edge CDNs. Distributed transcoding workers consuming queue tasks.',
  'Serving raw video files directly from origin servers; synchronous video encoding on web API servers.',
  '### Video Ingestion Pipeline
- Client uploads chunked video to Object Storage.
- S3 trigger -> Message Queue -> Transcoding Workers (FFmpeg) -> Multi-resolution chunks + .m3u8 playlist.
- CDN caches video segments near users.',
  NULL,
  'N/A',
  'Petabytes',
  1,
  NOW(),
  NOW()
),
(
  'sys-design-flash-sale',
  'system_design',
  '2. Case Studies',
  'Design an E-Commerce Flash Sale & Inventory Reservation System',
  'design-ecommerce-flash-sale',
  'Hard',
  2,
  'pending',
  1,
  61,
  NULL,
  'Ultra-high concurrency checkout system handling 100,000 req/sec for limited stock items with zero overselling.',
  'Never hit relational DB for inventory checks during flash sales! Pre-warm Redis with stock counters; use atomic DECR via Lua scripts. Temporary reservation with TTL (10 min checkout window). Async Kafka order queue.',
  'Database row-level lock contention on product record crashing DB; overselling inventory due to race conditions.',
  '### Flash Sale Architecture\n1. API Gateway with Token Bucket rate limiter\n2. Redis stock decrement: atomic DECR via Lua script\n3. Push order intent to Kafka -> Order workers write DB asynchronously',
  NULL,
  'O(1)',
  'O(Products)',
  1,
  NOW(),
  NOW()
),
(
  'sys-design-web-crawler',
  'system_design',
  '2. Case Studies',
  'Design a Distributed Web Crawler & Search Indexer (Google Bot)',
  'design-web-crawler-indexer',
  'Hard',
  2,
  'pending',
  1,
  64,
  NULL,
  'Scalable web crawler discovering, fetching, deduplicating, and indexing billions of web pages.',
  'URL Frontier with politeness queues (delay between requests to same domain) and priority queues. DNS caching to avoid DNS bottleneck. SimHash for near-duplicate HTML page detection.',
  'Spider traps (infinite loops on dynamic URLs); violating robots.txt; hitting target web servers too aggressively.',
  '### URL Frontier Design
- Priority Queues (PageRank importance)
- Queue Router -> Politeness Queues (one queue per hostname)
- Worker threads pull from politeness queues with rate limiters',
  NULL,
  'N/A',
  'Petabytes',
  1,
  NOW(),
  NOW()
),
(
  'sys-design-key-value-store',
  'system_design',
  '2. Case Studies',
  'Design a Distributed Key-Value Store (DynamoDB / Cassandra)',
  'design-distributed-key-value-store',
  'Hard',
  2,
  'pending',
  1,
  67,
  NULL,
  'Highly available, partitioned distributed key-value storage system with tunable consistency and LSM-Trees.',
  'Consistent hashing ring with virtual nodes. Gossip protocol for failure detection. Sloppy quorum and hinted handoff for high write availability. LSM-Trees (MemTable + WAL + SSTables) on disk.',
  'Read amplification when SSTable compaction lags behind; vector clock conflicts during concurrent writes.',
  '### LSM-Tree Write Path
1. Write to Write-Ahead Log (WAL) on disk for durability.
2. Write to in-memory MemTable (SkipList).
3. When MemTable is full, flush to disk as immutable SSTable.
4. Background compaction merges SSTables.',
  NULL,
  'O(1) write, O(log N) read',
  'O(Data Size)',
  1,
  NOW(),
  NOW()
),
(
  'sys-design-proximity-service',
  'system_design',
  '2. Case Studies',
  'Design a Proximity Service / Nearby Places (Yelp / Google Maps)',
  'design-proximity-service-yelp',
  'Medium',
  2,
  'pending',
  1,
  70,
  NULL,
  'Geospatial search query system returning top businesses or drivers within a specific radius of a user.',
  'Geohashing (Base32 representation of interleaved lat/lon bits) or Google S2 / Uber H3 hexagonal cells. Query matches prefix of current cell and 8 adjacent neighbors. In-memory indexing with Redis GEO.',
  'Using naive SQL `WHERE sqrt((x2-x1)^2 + (y2-y1)^2) < R` full table scan across millions of coordinates.',
  '### Geohash Precision
- Length 5: ~4.9 km x 4.9 km
- Length 6: ~1.2 km x 0.6 km (Ideal for city search)
- Query: Search current Geohash prefix + 8 adjacent cells to solve boundary edge cases.',
  NULL,
  'O(log N)',
  'O(Places)',
  1,
  NOW(),
  NOW()
),
(
  'sys-design-ride-sharing',
  'system_design',
  '2. Case Studies',
  'Design a Ride-Sharing Dispatch System (Uber / Lyft)',
  'design-ride-sharing-dispatch',
  'Hard',
  2,
  'pending',
  1,
  73,
  NULL,
  'Real-time driver location tracking, geospatial indexing, ride matching, and dynamic surge pricing.',
  'Drivers send GPS ping every 4s via WebSocket. Location ingestion service updates in-memory geospatial index (Uber H3 cells in Redis). Match engine queries nearby available drivers, computes ETA, and offers trip.',
  'Persisting every raw GPS ping to disk DB; driver acceptance race conditions where two drivers accept same ride.',
  '### Ride Dispatch Pipeline
- Driver Location Service: Ingests 4s pings into Redis Geospatial / H3 index.
- Trip Management Service: Rider requests trip -> Match Engine queries H3 cell -> Dispatches offer via push notification with 15s TTL.',
  NULL,
  'O(Drivers in cell)',
  'O(Active Drivers)',
  1,
  NOW(),
  NOW()
),
(
  'sys-design-social-news-feed',
  'system_design',
  '2. Case Studies',
  'Design a Social Network News Feed (Twitter / Instagram)',
  'design-social-news-feed',
  'Hard',
  2,
  'pending',
  1,
  76,
  NULL,
  'Feed generation and ranking architecture for hundreds of millions of users with diverse follower distributions.',
  'Hybrid fanout architecture: Fanout-on-write (push) for standard users (insert post ID into followers Redis feed lists). Fanout-on-read (pull) for celebrity accounts with millions of followers.',
  'Fanout-on-write for celebrities like Elon Musk (writing 100M redis entries takes minutes and overwhelms queues).',
  '### Hybrid Fanout Strategy
- Users with < 20,000 followers: Fanout-on-write (push to follower feed caches).
- Celebrity users (> 20,000 followers): Fanout-on-read (merge dynamically at read time).',
  NULL,
  'O(1) read, O(Followers) write',
  'O(Users * FeedSize)',
  1,
  NOW(),
  NOW()
),
(
  'sys-design-notification-service',
  'system_design',
  '2. Case Studies',
  'Design a Distributed Notification Service (APNs / FCM)',
  'design-notification-service',
  'Medium',
  2,
  'pending',
  1,
  79,
  NULL,
  'Scalable multi-channel notification platform handling millions of push notifications, SMS, and emails per second.',
  'Rate limiting per user and vendor. Prioritization queues (High: OTP/2FA, Medium: Transactions, Low: Marketing). Integration with APNs, FCM, Twilio with retry and circuit breakers.',
  'Marketing notifications delaying critical time-sensitive OTP security messages; retry storms crashing downstream vendors.',
  '### Priority Queues & Workers
- High Priority: OTP / Authentication (zero queue delay)
- Medium Priority: Order confirmations, chat alerts
- Low Priority: Promotional newsletters
- Circuit Breaker on 3rd-party vendor outages',
  NULL,
  'O(1)',
  'O(Queued Messages)',
  1,
  NOW(),
  NOW()
),
(
  'sys-design-task-scheduler',
  'system_design',
  '2. Case Studies',
  'Design a Distributed Task Scheduler & Job Orchestrator',
  'design-task-scheduler-orchestrator',
  'Hard',
  2,
  'pending',
  1,
  82,
  NULL,
  'Scalable distributed cron and delayed execution system capable of scheduling and executing millions of jobs at exact times.',
  'Time-partitioned delayed task queues using Redis Sorted Sets (`ZADD timestamp jobId`) or Kafka with partition timestamp indexing. Distributed worker heartbeat and lease lock mechanism to prevent duplicate execution.',
  'Split-brain leading to double execution of sensitive tasks (financial payments); timer drift across distributed worker nodes.',
  '### Delayed Queue Mechanics
- Producer: ZADD delayed_tasks <scheduled_timestamp> <taskId>
- Poller Worker: ZRANGEBYSCORE delayed_tasks 0 <now_timestamp> LIMIT 100
- Atomic pop using Lua script, then push to active execution queue.',
  NULL,
  'O(log N)',
  'O(Scheduled Jobs)',
  1,
  NOW(),
  NOW()
),
(
  'sys-design-metrics-monitoring',
  'system_design',
  '2. Case Studies',
  'Design a Metrics Monitoring & Alerting System (Prometheus / Datadog)',
  'design-metrics-monitoring-system',
  'Hard',
  2,
  'pending',
  1,
  85,
  NULL,
  'High-throughput telemetry ingestion, time-series storage, downsampling, and automated alerting engine.',
  'Pull model (Prometheus scraper) vs Push model (statsd daemon). Time-Series Database (TSDB) with delta-of-delta timestamp compression (Gorilla). Multi-tiered retention and downsampling rollups.',
  'High-cardinality label explosion (e.g. user_id as metric label) causing memory explosion in TSDB index; alert flapping.',
  '### TSDB Downsampling Tiers
- Raw metrics: Retained 7 days (10s resolution)
- 1-minute Rollup: Retained 30 days (avg, min, max, p99)
- 1-hour Rollup: Retained 1 year
- Alert rules evaluated against sliding windows',
  NULL,
  'O(1) append',
  'O(Metrics * Time)',
  1,
  NOW(),
  NOW()
),
(
  'be-csharp-records-structs',
  'backend',
  '1. C# Fundamentals (Daily)',
  'Classes vs Records vs Structs',
  'csharp-classes-records-structs',
  'Medium',
  1,
  'pending',
  1,
  2,
  NULL,
  'Value types vs Reference types, value equality in records, with-expressions, and stack vs heap allocations.',
  'Structs on stack (avoid boxing!). Records are classes with compiler synthesized value-based equality and "with" mutation: ideal for DTOs and immutable events.',
  'Boxing structs when casting to object or interfaces; mutating mutable structs; large structs (> 16 bytes) incurring copy cost.',
  '### C# Type Comparison
- Class: Reference type on Heap
- Record Class: Synthesized value equality, immutable by default, with keyword
- Record Struct: Value type on Stack, zero heap allocations
- readonly struct: Compiler enforces immutability; avoids defensive copying.',
  'public record OrderDto(Guid Id, string CustomerEmail, decimal TotalAmount);

var order = new OrderDto(Guid.NewGuid(), "user@test.com", 99.99m);
var updated = order with { TotalAmount = 89.99m };',
  'O(1)',
  'O(1)',
  1,
  NOW(),
  NOW()
),
(
  'be-csharp-interfaces-generics',
  'backend',
  '1. C# Fundamentals (Daily)',
  'Interfaces, Generics & Generic Constraints',
  'csharp-interfaces-generics-constraints',
  'Medium',
  1,
  'pending',
  1,
  4,
  NULL,
  'Decoupling implementations with interfaces, type parameter constraints, and generic repositories.',
  'Generics eliminate runtime casting and boxing. Generic constraints (where T : class, IEntity, new()) enforce compile-time safety.',
  'Creating generic repository anti-patterns that leak IQueryable and hide EF Core capabilities.',
  '### Generic Constraints Cheat Sheet
- where T : struct
- where T : class
- where T : notnull
- where T : new()
- where T : BaseClass, IInterface',
  'public interface IRepository<TEntity> where TEntity : class, IAuditableEntity
{
    Task<TEntity?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(TEntity entity, CancellationToken ct = default);
}',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-csharp-linq-deferred-execution',
  'backend',
  '1. C# Fundamentals (Daily)',
  'LINQ & Deferred Execution (IEnumerable vs IQueryable)',
  'csharp-linq-deferred-execution',
  'Medium',
  1,
  'pending',
  1,
  6,
  NULL,
  'Deferred execution hazards (multiple enumeration), and IEnumerable in-memory vs IQueryable SQL expression trees.',
  'LINQ queries execute only when enumerated. IQueryable translates expression trees to SQL; IEnumerable runs in C# memory. Calling .ToList() too early pulls entire tables into RAM!',
  'Multiple enumeration: iterating an unmaterialized IEnumerable twice executes the underlying query or API call twice! Use .ToList() before re-enumerating.',
  '### IEnumerable vs IQueryable
- IQueryable<T>: Uses Expression<Func<T, bool>>, translated to SQL by EF Core.
- IEnumerable<T>: Uses compiled Func<T, bool>, evaluated in .NET memory.',
  '// SQL query with WHERE Status = 1
IQueryable<Order> query = dbContext.Orders.Where(o => o.Status == OrderStatus.Completed);',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-csharp-delegates-events',
  'backend',
  '1. C# Fundamentals (Daily)',
  'Delegates, Func/Action & Events',
  'csharp-delegates-func-action-events',
  'Medium',
  1,
  'pending',
  1,
  8,
  NULL,
  'Type-safe function pointers, Func<T, TResult>, Action<T>, and event-driven decoupling.',
  'Action represents void methods; Func represents methods returning a value. Predicate<T> returns bool. Events encapsulate delegates with add/remove accessors.',
  'Memory leaks when subscribing to events without unsubscribing (publisher holds strong reference to subscriber).',
  '### Delegate Best Practices
- Prefer built-in Action and Func over custom delegate definitions.
- Use WeakReference or IDisposable to unsubscribe events.',
  'public event EventHandler<OrderCreatedEventArgs>? OrderCreated;
protected virtual void OnOrderCreated(OrderCreatedEventArgs e) => OrderCreated?.Invoke(this, e);',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-csharp-idisposable-using',
  'backend',
  '1. C# Fundamentals (Daily)',
  'IDisposable, Finalizers & IAsyncDisposable',
  'csharp-idisposable-using-cleanup',
  'Medium',
  1,
  'pending',
  1,
  10,
  NULL,
  'Deterministic unmanaged resource cleanup, using var statements, and await using for asynchronous streams.',
  'GC only manages CLR memory. Unmanaged resources (file handles, DB connections, sockets) require deterministic cleanup via IDisposable.Dispose(). await using prevents thread blocking during I/O teardown.',
  'Leaking DB connections or HttpClient instances; suppressing finalizers without calling GC.SuppressFinalize(this).',
  '### Dispose Pattern Best Practices
- Use using var x = new Resource();
- For I/O teardown, implement IAsyncDisposable with await using.
- Always call GC.SuppressFinalize(this) in Dispose().',
  'await using var stream = new FileStream("data.bin", FileMode.Open);
await using var reader = new StreamReader(stream);
var text = await reader.ReadToEndAsync();',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-async-await-state-machine',
  'backend',
  '2. Async Programming (Everyday)',
  'async / await State Machine & Task Internals',
  'async-await-state-machine-task-internals',
  'Hard',
  1,
  'pending',
  1,
  12,
  NULL,
  'How C# transforms async methods into state machine structs, Task completion, and non-blocking continuation callbacks.',
  'await does NOT block OS threads. When I/O begins, the thread returns to ThreadPool. When I/O completes via OS completion ports, ThreadPool resumes execution.',
  'Sync-over-async (.Result or .Wait()) starves ThreadPool threads and causes deadlocks! Never block on Tasks in ASP.NET Core.',
  '### Key Rules for Async in .NET
1. Async all the way down.
2. Never call .Result or .Wait().
3. Use ValueTask<T> when operations frequently complete synchronously (e.g. cache hit).',
  'public async Task<OrderResponse> GetOrderAsync(Guid id, CancellationToken ct)
{
    var response = await _httpClient.GetFromJsonAsync<OrderDto>($"/api/orders/{id}", ct);
    return new OrderResponse(response);
}',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-async-task-whenall-cancellation',
  'backend',
  '2. Async Programming (Everyday)',
  'Task.WhenAll, Concurrency & CancellationToken',
  'task-whenall-concurrency-cancellation',
  'Medium',
  1,
  'pending',
  1,
  14,
  NULL,
  'Running multiple asynchronous tasks concurrently, cooperative cancellation propagation, and aggregating multi-task exceptions.',
  'Task.WhenAll launches independent I/O tasks concurrently: 3 calls taking 100ms finish in ~100ms total. CancellationToken enables graceful cancellation when clients disconnect.',
  'Forgetting to pass CancellationToken to DB/HTTP calls; ignoring OperationCanceledException.',
  '### Task.WhenAll with CancellationToken
- Pass ct to all child calls.
- Task.WhenAll aggregates all inner exceptions in task.Exception.InnerExceptions.',
  'public async Task<DashboardData> LoadDashboardAsync(Guid userId, CancellationToken ct)
{
    var u = _userService.GetUserAsync(userId, ct);
    var o = _orderService.GetRecentOrdersAsync(userId, ct);
    var s = _metricsService.GetUserMetricsAsync(userId, ct);
    await Task.WhenAll(u, o, s);
    return new DashboardData(await u, await o, await s);
}',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-async-configureawait-context',
  'backend',
  '2. Async Programming (Everyday)',
  'ConfigureAwait(false) & SynchronizationContext',
  'configureawait-synchronization-context',
  'Medium',
  1,
  'pending',
  1,
  16,
  NULL,
  'When ConfigureAwait matters: ASP.NET Core has no SynchronizationContext, but class libraries targeting general .NET must use ConfigureAwait(false).',
  'ASP.NET Core has NO SynchronizationContext: all continuations resume on arbitrary ThreadPool threads. ConfigureAwait(false) is redundant in controllers, but mandatory in shared NuGet libraries.',
  'Thinking ASP.NET Core controllers need ConfigureAwait(false); omitting it in reusable library code consumed by desktop/WPF apps.',
  '### ConfigureAwait Summary
- ASP.NET Core Controllers & Services: Not required.
- Reusable NuGet Class Libraries: Always use .ConfigureAwait(false).',
  NULL,
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-aspnet-middleware-pipeline',
  'backend',
  '3. ASP.NET Core Web API',
  'Middleware Pipeline Execution & Custom Middleware',
  'aspnet-middleware-pipeline-custom',
  'Medium',
  1,
  'pending',
  1,
  18,
  NULL,
  'HTTP requests and responses travelling through delegates in ASP.NET Core: execution order and short-circuiting.',
  'Russian doll execution order: 1 -> 2 -> 3 -> Endpoint -> 3 -> 2 -> 1. Short-circuiting happens when a middleware returns early without calling next().',
  'Ordering bugs! Putting UseAuthorization() before UseAuthentication(); placing error handling middleware after components that throw.',
  '### Canonical Middleware Order
1. ExceptionHandler
2. Hsts
3. Routing
4. Cors
5. Authentication
6. Authorization
7. Custom business middleware
8. Endpoints',
  'public class CorrelationIdMiddleware
{
    private readonly RequestDelegate _next;
    public CorrelationIdMiddleware(RequestDelegate next) => _next = next;
    public async Task InvokeAsync(HttpContext context)
    {
        var cid = context.Request.Headers["X-Correlation-ID"].FirstOrDefault() ?? Guid.NewGuid().ToString();
        context.Response.Headers["X-Correlation-ID"] = cid;
        await _next(context);
    }
}',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-aspnet-controllers-vs-minimal-apis',
  'backend',
  '3. ASP.NET Core Web API',
  'Controllers vs Minimal APIs & Route Handling',
  'controllers-vs-minimal-apis',
  'Medium',
  1,
  'pending',
  1,
  20,
  NULL,
  'Trade-offs between Controller-based APIs and high-performance Minimal APIs, endpoint routing, and TypedResults.',
  'Minimal APIs bypass heavy MVC reflection and action filter pipelines, yielding faster startup times and higher req/sec. TypedResults in .NET 7/8 provides strong typing for OpenAPI.',
  'Dumping hundreds of minimal API endpoints into Program.cs without modular extension methods.',
  '### Minimal APIs Best Practices
- Organize using route group extension methods.
- Return Results.Ok() or TypedResults.Ok<T>().',
  'var group = app.MapGroup("/api/orders").RequireAuthorization();
group.MapGet("/{id:guid}", async (Guid id, IOrderService service, CancellationToken ct) => {
    var order = await service.GetByIdAsync(id, ct);
    return order is not null ? Results.Ok(order) : Results.NotFound();
});',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-aspnet-filters-validation',
  'backend',
  '3. ASP.NET Core Web API',
  'Validation (FluentValidation) & Action/Exception Filters',
  'aspnet-validation-filters-fluentvalidation',
  'Medium',
  1,
  'pending',
  1,
  22,
  NULL,
  'Separating request validation rules from models using FluentValidation, and managing cross-cutting concerns with filters.',
  'FluentValidation separates validation logic into testable validator classes. Return RFC 7807 ValidationProblemDetails on failure.',
  'Putting business logic inside validation rules (e.g. database lookups in simple validators); throwing exceptions for standard validation errors.',
  '### FluentValidation Setup
- AbstractValidator<CreateOrderRequest>
- RuleFor(x => x.Email).NotEmpty().EmailAddress();
- Return standard RFC 7807 ValidationProblemDetails.',
  'public class CreateOrderValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
    }
}',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-di-lifetimes-captive-dependencies',
  'backend',
  '4. Dependency Injection',
  'Service Lifetimes & The Captive Dependency Trap',
  'di-lifetimes-captive-dependencies',
  'Medium',
  2,
  'pending',
  1,
  24,
  NULL,
  'Transient vs Scoped vs Singleton, service provider scopes, and detecting the dreaded Captive Dependency bug.',
  'Singleton = created once. Scoped = once per HTTP request. Transient = new instance every injection. CAPTIVE DEPENDENCY BUG: Injecting Scoped into Singleton captures it forever, causing memory leaks and DbContext concurrency crashes!',
  'Injecting DbContext (Scoped) into a BackgroundService (Singleton); not enabling DI scope validation in Development.',
  '### How to Fix Captive Dependencies
- Inject IServiceScopeFactory into Singleton.
- using var scope = _scopeFactory.CreateScope();
- var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();',
  'public class QueueProcessor : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    public QueueProcessor(IServiceScopeFactory sf) => _scopeFactory = sf;
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await ProcessAsync(db, ct);
    }
}',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-sql-joins-indexes-optimization',
  'backend',
  '5. Database Skills (SQL & EF Core)',
  'SQL: Joins, Indexes (Clustered vs Non-Clustered) & Execution Plans',
  'sql-joins-indexes-query-optimization',
  'Hard',
  1,
  'pending',
  1,
  26,
  NULL,
  'Relational query mechanics, Index Seek vs Index Scan, Clustered (B-Tree data leaf) vs Non-Clustered indexes, and query profiling.',
  'Clustered index defines physical order of table on disk (1 per table). Non-clustered index is a separate B-tree mapping to clustered key. Index Seek traverses in O(log N); Index Scan reads whole index. Covering indexes include queried columns, avoiding Key Lookups.',
  'Applying functions to indexed columns in WHERE clause (WHERE YEAR(CreatedDate) = 2026) breaks index sargability, forcing full table scans!',
  '### SQL Optimization Checklist
1. Sargable WHERE clauses (no functions on columns).
2. Index Seek vs Scan in execution plan.
3. Include columns to avoid Key Lookups.
4. Avoid NOLOCK without understanding dirty read implications.',
  '-- Sargable:
SELECT Id, Amount FROM Orders WHERE CreatedDate >= ''2026-01-01'' AND CreatedDate < ''2027-01-01'';
-- Non-sargable:
SELECT Id, Amount FROM Orders WHERE YEAR(CreatedDate) = 2026;',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-efcore-asnotracking-performance',
  'backend',
  '5. Database Skills (SQL & EF Core)',
  'EF Core: AsNoTracking, Change Tracker & Read Performance',
  'efcore-asnotracking-change-tracker-performance',
  'Medium',
  1,
  'pending',
  1,
  28,
  NULL,
  'Optimizing Entity Framework Core read queries by disabling identity resolution and change tracking snapshots with .AsNoTracking().',
  'By default, EF Core takes a memory snapshot of loaded entities to detect mutations for SaveChangesAsync(). For read-only GET endpoints, .AsNoTracking() bypasses Change Tracker, cutting query time and RAM by 30-50%.',
  'Calling .AsNoTracking() and then attempting to modify and save with SaveChangesAsync() without re-attaching.',
  '### EF Core Performance Rules
1. Use .AsNoTracking() on read queries.
2. Project directly to DTOs via .Select(): EF Core generates SQL selecting ONLY those columns!
3. Split queries for multiple includes.',
  'public async Task<List<OrderDto>> GetOrdersAsync(Guid customerId, CancellationToken ct)
{
    return await _dbContext.Orders
        .AsNoTracking()
        .Where(o => o.CustomerId == customerId)
        .Select(o => new OrderDto(o.Id, o.CustomerEmail, o.TotalAmount))
        .ToListAsync(ct);
}',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-efcore-n-plus-1-include-split',
  'backend',
  '5. Database Skills (SQL & EF Core)',
  'EF Core: N+1 Problem, Eager Loading (.Include) & Split Queries',
  'efcore-n-plus-one-include-split-queries',
  'Medium',
  1,
  'pending',
  1,
  30,
  NULL,
  'Preventing the N+1 query performance killer, eager loading with .Include(), and avoiding Cartesian product explosion with .AsSplitQuery().',
  'N+1 occurs when querying 100 orders, and accessing order.Customer.Name in a loop triggers 100 separate queries! Fix via Eager Loading (.Include()). Including multiple child collections creates Cartesian explosion; use .AsSplitQuery().',
  'Lazy loading enabled without realization, silently sending hundreds of roundtrips to SQL Server.',
  '### Cartesian Explosion vs Split Queries
- .Include(o => o.Items).Include(o => o.Logs) returns Items * Logs duplicate rows!
- .AsSplitQuery() executes clean, targeted parallel queries.',
  'var orders = await _dbContext.Orders
    .AsNoTracking()
    .Include(o => o.Customer)
    .Include(o => o.Items)
    .AsSplitQuery()
    .ToListAsync(ct);',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-api-design-rest-pagination-idempotency',
  'backend',
  '6. API Design',
  'API Design: Keyset Pagination, Status Codes & Idempotency',
  'api-design-keyset-pagination-idempotency',
  'Medium',
  2,
  'pending',
  1,
  32,
  NULL,
  'Offset vs Keyset (Cursor) pagination on millions of rows, RFC 7807 ProblemDetails, and Idempotency-Key headers.',
  'OFFSET 1000000 scans and discards 1M rows! Keyset pagination (WHERE Id > @cursor ORDER BY Id LIMIT 20) uses B-tree index in O(1). Idempotency keys prevent double mutation on retry.',
  'Using OFFSET pagination on deep pages; returning 200 OK with error body instead of proper HTTP 4xx/5xx status codes.',
  '### Keyset Pagination
- Orders by (CreatedAt, Id)
- Query: WHERE CreatedAt < @lastDate OR (CreatedAt = @lastDate AND Id < @lastId)
- Constant O(1) performance at any page depth!',
  NULL,
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-auth-jwt-claims-policies',
  'backend',
  '7. Authentication & Authorization',
  'JWT Authentication, Claims & Policy-Based Authorization',
  'jwt-auth-claims-policies-aspnet',
  'Medium',
  3,
  'pending',
  1,
  34,
  NULL,
  'Configuring JwtBearer in ASP.NET Core, symmetric vs asymmetric keys, claims extraction, and policy requirements.',
  'Authentication verifies token signature and expiration. Policy-based authorization ([Authorize(Policy = "CanRefundOrders")]) allows dynamic condition checks.',
  'Validating tokens without checking issuer or audience; storing secrets in JWT claims (claims are base64 readable!).',
  '### Policy Configuration
builder.Services.AddAuthorization(opt => {
  opt.AddPolicy("ManagerOnly", p => p.RequireRole("Manager"));
});',
  'app.MapPost("/api/orders/{id}/refund", async (Guid id, IOrderService s) => {
    await s.RefundAsync(id);
    return Results.NoContent();
}).RequireAuthorization("ManagerOnly");',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-messaging-kafka-internals',
  'backend',
  '8. Messaging Systems (Kafka & NATS)',
  'Apache Kafka: Partitions, Consumer Groups & Offsets',
  'kafka-partitions-consumer-groups-offsets',
  'Hard',
  2,
  'pending',
  1,
  36,
  NULL,
  'Distributed commit logs, message partitioning key strategy, consumer group scaling limits, and commit offset semantics.',
  'Kafka partitions are append-only sequential files on disk. Ordering guaranteed ONLY within a single partition! Within a Consumer Group, each partition is read by 1 consumer.',
  'Doing heavy synchronous DB work in consumer loop causing heartbeat timeout and rebalancing storms!',
  '### Offset Commit Semantics
- At-most-once: Commit before processing (loss risk).
- At-least-once (Standard): Process, then commit (requires idempotent consumer!).
- Exactly-once: Kafka transactional producer.',
  'using var consumer = new ConsumerBuilder<string, string>(config).Build();
consumer.Subscribe("orders");
while (!ct.IsCancellationRequested) {
    var cr = consumer.Consume(ct);
    await ProcessEventAsync(cr.Message.Value, ct);
    consumer.Commit(cr);
}',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-messaging-nats-jetstream',
  'backend',
  '8. Messaging Systems (Kafka & NATS)',
  'NATS Core vs JetStream: Streams, Deduplication & Consumers',
  'nats-core-vs-jetstream-patterns',
  'Medium',
  2,
  'pending',
  1,
  38,
  NULL,
  'High-performance messaging with NATS: Core publish-subscribe vs JetStream persistence, deduplication windows, and durable consumers.',
  'NATS Core is in-memory fire-and-forget (microsecond latency). JetStream adds persistence, stream replay, and message deduplication (Nats-Msg-Id header).',
  'Using NATS Core for critical financial events without JetStream persistence.',
  '### NATS vs Kafka
- NATS: Single Go binary, microsecond latency, subject-based routing (orders.*.created).
- Kafka: Heavyweight log storage, partitioned big data streams.',
  'var js = natsConnection.CreateJetStreamContext();
var msg = new Msg("orders.created", payload) {
    Header = { ["Nats-Msg-Id"] = orderId.ToString() }
};
await js.PublishAsync(msg);',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-messaging-dlq-idempotent-consumer',
  'backend',
  '8. Messaging Systems (Kafka & NATS)',
  'Dead Letter Queues (DLQ), Retries & Idempotent Consumers',
  'dlq-retries-idempotent-consumers',
  'Hard',
  2,
  'pending',
  1,
  40,
  NULL,
  'Handling poison pill messages without blocking event streams, exponential backoff retry topics, and consumer deduplication tables.',
  'Network retries guarantee duplicates. Consumers MUST be idempotent: check ProcessedEvents table in DB; if event ID exists, ACK and skip! Repeated failures route to DLQ.',
  'Infinite retry loops blocking the consumer partition; missing unique constraint on MessageId in DB.',
  '### Idempotent Consumer Flow
1. BEGIN DB Transaction
2. INSERT INTO ProcessedEvents (Id) VALUES (@id) -> If Duplicate: ACK and return
3. Execute business mutation
4. COMMIT
5. ACK message',
  NULL,
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-grpc-protobuf-streaming',
  'backend',
  '9. gRPC',
  'gRPC & Protocol Buffers (Unary vs Streaming RPC)',
  'grpc-protobuf-streaming-dotnet',
  'Medium',
  3,
  'pending',
  1,
  42,
  NULL,
  'Binary serialization over HTTP/2, Protobuf contracts, Unary vs Streaming RPC, and RpcException error handling.',
  'gRPC replaces text JSON/HTTP with binary Protobuf over multiplexed HTTP/2. Payloads 7-10x smaller, 5-8x faster serialization. Schema strongly typed via .proto files.',
  'Changing Protobuf field tag numbers (int32 id = 1 -> 2) breaks binary backward compatibility with existing clients.',
  '### gRPC RPC Types
- Unary: 1 req -> 1 res
- Server Streaming: 1 req -> Stream of res
- Client Streaming: Stream of req -> 1 res
- Bidirectional: Stream <-> Stream',
  'public override async Task<OrderReply> GetOrder(OrderRequest req, ServerCallContext ctx)
{
    var order = await _repo.FindByIdAsync(Guid.Parse(req.OrderId));
    if (order is null) throw new RpcException(new Status(StatusCode.NotFound, "Not found"));
    return new OrderReply { OrderId = order.Id.ToString(), Amount = (double)order.Total };
}',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-background-channels-hosted-services',
  'backend',
  '10. Background Processing',
  'BackgroundService & System.Threading.Channels',
  'background-services-threading-channels',
  'Hard',
  3,
  'pending',
  1,
  44,
  NULL,
  'High-throughput producer-consumer background queues in .NET using thread-safe, lock-free bounded Channels.',
  'System.Threading.Channels provides an ultra-fast, zero-allocation asynchronous producer-consumer channel. Bounded channels provide backpressure (throttles producers if consumers lag).',
  'Using unbounded channels: if producers write faster than workers can process, process runs out of RAM (OOM)!',
  '### Bounded Channel Setup
var channel = Channel.CreateBounded<WorkItem>(new BoundedChannelOptions(1000) {
  FullMode = BoundedChannelFullMode.Wait
});',
  'public class ChannelWorker : BackgroundService
{
    private readonly ChannelReader<WorkItem> _reader;
    public ChannelWorker(Channel<WorkItem> ch) => _reader = ch.Reader;
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        await foreach (var item in _reader.ReadAllAsync(ct)) {
            await ProcessAsync(item);
        }
    }
}',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-caching-redis-cache-aside',
  'backend',
  '11. Caching',
  'Redis Distributed Caching, Cache-Aside & Stampede Mitigation',
  'redis-distributed-cache-aside-stampede',
  'Medium',
  4,
  'pending',
  1,
  46,
  NULL,
  'In-Memory cache vs Redis, Cache-Aside read/write lifecycle, TTL sliding vs absolute expiration, and thundering herd stampede protection.',
  'In-memory cache is fastest but single-pod local. Redis provides shared distributed state across scaled pods. Protect hot keys from cache stampede using SemaphoreSlim or probabilistic early expiration.',
  'Caching without TTL causing memory leaks; storing large uncompressed JSON strings in Redis.',
  '### Cache-Aside
1. Check Redis
2. If HIT: return
3. If MISS: load DB, write Redis with TTL, return',
  'public async Task<ProductDto?> GetProductAsync(Guid id, CancellationToken ct)
{
    string key = $"prod:{id}";
    var val = await _redis.StringGetAsync(key);
    if (!val.IsNullOrEmpty) return JsonSerializer.Deserialize<ProductDto>(val!);
    var p = await _db.Products.FindAsync(id);
    if (p is not null) await _redis.StringSetAsync(key, JsonSerializer.Serialize(p), TimeSpan.FromMinutes(10));
    return p;
}',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-logging-opentelemetry-serilog',
  'backend',
  '12. Logging & Monitoring',
  'Structured Logging (Serilog), Correlation IDs & OpenTelemetry',
  'structured-logging-serilog-opentelemetry',
  'Medium',
  4,
  'pending',
  1,
  48,
  NULL,
  'Message templates over string interpolation in Serilog, W3C TraceContext propagation across HTTP and Kafka, and Prometheus metrics.',
  'Never use string interpolation in logs ($"Processing {id}")! Use message templates ("Processing order {OrderId}"): Serilog preserves parameters as searchable JSON attributes. OpenTelemetry standardizes traces.',
  'Logging sensitive customer credentials or credit card numbers (PII/PCI compliance violations).',
  '### Structured Logging
- WRONG: _logger.LogInformation($"Order {id} failed");
- CORRECT: _logger.LogInformation("Order {OrderId} failed", id);',
  'Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(config)
    .Enrich.FromLogContext()
    .Enrich.WithCorrelationId()
    .WriteTo.Console(new JsonFormatter())
    .CreateLogger();',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-testing-xunit-webapplicationfactory',
  'backend',
  '13. Testing',
  'Unit Testing (xUnit, Moq) & Integration Testing (WebApplicationFactory)',
  'testing-xunit-moq-webapplicationfactory',
  'Medium',
  3,
  'pending',
  1,
  50,
  NULL,
  'Writing fast unit tests with xUnit & Moq, and spinning up in-memory test servers with WebApplicationFactory for real HTTP end-to-end testing.',
  'Unit tests mock dependencies. Integration tests test real ASP.NET Core pipeline using WebApplicationFactory<Program>: real routing, validation, middleware without network ports.',
  'Testing trivial getters/setters instead of business logic; writing brittle tests that assert private details.',
  '### WebApplicationFactory
- Spins up TestServer in-memory
- Overrides DI services with TestContainers or In-Memory DB
- Calls real HTTP endpoints via client.GetAsync("/api/...")',
  'public class OrderApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    public OrderApiTests(WebApplicationFactory<Program> f) => _client = f.CreateClient();
    [Fact]
    public async Task Health_ReturnsOk() {
        var res = await _client.GetAsync("/healthz");
        res.EnsureSuccessStatusCode();
    }
}',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-docker-multistage-dotnet',
  'backend',
  '14. Docker & CI/CD',
  'Multi-Stage Dockerfile for .NET & Container Security',
  'docker-multistage-dotnet-containers',
  'Medium',
  4,
  'pending',
  1,
  52,
  NULL,
  'Building lightweight production container images using SDK build stages, chiseled runtime base images, and non-root execution.',
  'Multi-stage Dockerfile: build and publish in Stage 1 with full SDK; copy compiled binaries into minimal runtime image (aspnet:8.0-chiseled). Reduces size from 800MB to ~100MB and eliminates compiler attack surface.',
  'Running container as root in production; baking appsettings secrets into Docker image layers.',
  '### Multi-Stage Blueprint
Stage 1: FROM dotnet/sdk:8.0 AS build
Stage 2: FROM dotnet/aspnet:8.0-chiseled AS final
USER app',
  'FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0-chiseled AS final
WORKDIR /app
COPY --from=build /app/publish .
USER app
ENTRYPOINT ["dotnet", "MyApp.dll"]',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-cicd-github-actions-azure-devops',
  'backend',
  '14. Docker & CI/CD',
  'CI/CD Pipelines: Azure DevOps & GitHub Actions Automation',
  'cicd-github-actions-azure-devops',
  'Medium',
  4,
  'pending',
  1,
  54,
  NULL,
  'Automating build, test verification, container registry push, and automated deployment with secrets and rollbacks.',
  'CI triggers on PR: dotnet build, dotnet test, SonarQube quality gate. CD builds Docker image, pushes to ACR/ECR, updates Kubernetes Helm release. Zero-downtime Blue/Green deployments.',
  'Allowing PRs to merge with failing unit tests; hardcoding connection strings in pipeline YAML files.',
  '### Pipeline Steps
1. actions/checkout@v4
2. actions/setup-dotnet@v4
3. dotnet test --configuration Release
4. docker/build-push-action@v5',
  NULL,
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-git-branching-rebase-conflict',
  'backend',
  '16. Git Mastery (Daily)',
  'Git Mastery: Interactive Rebase, Cherry-Pick & Conflict Resolution',
  'git-interactive-rebase-cherry-pick',
  'Medium',
  3,
  'pending',
  1,
  56,
  NULL,
  'Keeping a clean linear git history using interactive rebase (git rebase -i), safe cherry-picking, and resolving complex 3-way merge conflicts.',
  'git rebase replays commits on top of latest main for a linear commit history. git cherry-pick <hash> applies an isolated hotfix directly into a release branch without merging unready code.',
  'Rebasing a public shared branch that other developers have already pulled (rewrites commit SHA hashes!).',
  '### Essential Commands
- git rebase -i HEAD~4 (squash WIP commits)
- git pull --rebase origin main
- git cherry-pick <hash>',
  NULL,
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-prod-polly-resilience-circuit-breaker',
  'backend',
  '17. Production Skills (SDE2 Level)',
  'Resilience with Polly: Retries, Exponential Backoff & Circuit Breakers',
  'polly-resilience-retry-circuit-breaker',
  'Hard',
  1,
  'pending',
  1,
  58,
  NULL,
  'Protecting microservices from transient network failures and cascading crashes using Microsoft.Extensions.Resilience (Polly v8).',
  'Circuit Breaker monitors failure rates: if > 50% calls fail over 30s, it trips OPEN, failing requests instantly without network traffic. After cooldown, HALF-OPEN tests recovery.',
  'Retrying non-idempotent HTTP POST mutations without idempotency keys; retrying without jitter.',
  '### Microsoft.Extensions.Resilience (.NET 8+)
builder.Services.AddHttpClient<IExternalApi>().AddStandardResilienceHandler();
Includes Timeout (10s), Retry (3 attempts + jitter), Circuit Breaker, Rate Limiter.',
  'builder.Services.AddHttpClient<IOrderClient, OrderClient>(c => {
    c.BaseAddress = new Uri("https://api.internal");
})
.AddStandardResilienceHandler(options => {
    options.Retry.MaxRetryAttempts = 3;
    options.Retry.BackoffType = DelayBackoffType.Exponential;
    options.Retry.UseJitter = true;
});',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-prod-memory-gc-generations',
  'backend',
  '17. Production Skills (SDE2 Level)',
  'CLR Memory Management: GC Generations (0, 1, 2) & LOH',
  'clr-gc-generations-large-object-heap',
  'Hard',
  1,
  'pending',
  1,
  60,
  NULL,
  'How .NET garbage collection operates: Gen 0 ephemeral allocations, Gen 1 buffer, Gen 2 long-lived objects, and Large Object Heap (LOH) fragmentation.',
  'Generational hypothesis: newly created objects die young! Gen 0 sub-millisecond pauses collect 95% of objects. Objects >= 85,000 bytes go to LOH (not compacted by default). Use ArrayPool<byte>.Shared to reuse buffers.',
  'Allocating large byte arrays repeatedly in Web API request handlers, triggering frequent full Gen 2 / LOH blocking GC pauses.',
  '### Memory Optimization Rules
1. Use ArrayPool<T>.Shared.Rent(size) and return in finally.
2. Use Span<T> and ReadOnlySpan<char> to slice strings without heap allocations.
3. Profile using dotnet-gcdump to track memory leaks.',
  'var pool = ArrayPool<byte>.Shared;
byte[] buffer = pool.Rent(100_000);
try {
    int read = await stream.ReadAsync(buffer.AsMemory(0, 100_000), ct);
    Process(buffer, read);
} finally {
    pool.Return(buffer);
}',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-prod-rate-limiting-dotnet',
  'backend',
  '17. Production Skills (SDE2 Level)',
  'Rate Limiting Middleware in .NET 7/8',
  'rate-limiting-middleware-dotnet',
  'Medium',
  1,
  'pending',
  1,
  62,
  NULL,
  'Built-in ASP.NET Core rate limiting algorithms (Token Bucket, Sliding Window, Fixed Window) and custom client partitioners.',
  'Built-in Microsoft.AspNetCore.RateLimiting eliminates 3rd-party dependencies. Partition rate limits dynamically by client IP or authenticated user ID. Return HTTP 429 with Retry-After.',
  'Applying a single global rate limit across all clients, allowing one rogue client to exhaust the budget for all legitimate users.',
  '### Built-in .NET 8 Rate Limiter
- FixedWindowLimiter
- SlidingWindowLimiter
- TokenBucketLimiter (burst friendly)
- ConcurrencyLimiter',
  'builder.Services.AddRateLimiter(options => {
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddTokenBucketLimiter("token-policy", opt => {
        opt.TokenLimit = 100;
        opt.ReplenishmentPeriod = TimeSpan.FromSeconds(10);
        opt.TokensPerPeriod = 20;
    });
});
app.UseRateLimiter();',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-prod-concurrency-semaphores-locks',
  'backend',
  '17. Production Skills (SDE2 Level)',
  'Thread Safety: SemaphoreSlim, Interlocked & Concurrent Collections',
  'concurrency-semaphoreslim-interlocked',
  'Hard',
  1,
  'pending',
  1,
  64,
  NULL,
  'Safe multi-threaded code in backend services: why you cannot use lock with await, SemaphoreSlim for async throttling, and atomic Interlocked operations.',
  'YOU CANNOT await INSIDE A C# lock BLOCK! To synchronize asynchronous operations, use SemaphoreSlim(1, 1) with await semaphore.WaitAsync(). For counters, use Interlocked.Increment() for lock-free atomics.',
  'Deadlocks when acquiring multiple semaphores in different orders across services; forgetting semaphore.Release() in a finally block.',
  '### Async Lock Template
private readonly SemaphoreSlim _gate = new SemaphoreSlim(1, 1);
await _gate.WaitAsync();
try { await DoWorkAsync(); } finally { _gate.Release(); }',
  'private static readonly SemaphoreSlim _throttle = new SemaphoreSlim(5, 5);
public async Task<string> CallApiWithThrottleAsync(string url, CancellationToken ct) {
    await _throttle.WaitAsync(ct);
    try { return await _http.GetStringAsync(url, ct); }
    finally { _throttle.Release(); }
}',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
),
(
  'be-prod-configuration-feature-flags',
  'backend',
  '17. Production Skills (SDE2 Level)',
  'Configuration Management (IOptions) & Feature Flags',
  'configuration-ioptions-feature-flags',
  'Medium',
  2,
  'pending',
  1,
  66,
  NULL,
  'Strongly typed configuration using IOptions / IOptionsSnapshot / IOptionsMonitor, and zero-downtime dark launches with Microsoft.FeatureManagement.',
  'Never read _config["MyKey"] directly. Bind to POCO classes using IOptions<T> (Singleton), IOptionsSnapshot<T> (scoped per request), or IOptionsMonitor<T> (hot-reload notifications). Feature flags decouple deployment from release.',
  'Using IOptionsSnapshot inside a Singleton service (captive dependency!); storing unencrypted secrets in git.',
  '### IOptions Flavor Guide
- IOptions<T>: Singleton, registered at startup.
- IOptionsSnapshot<T>: Scoped, computed per request.
- IOptionsMonitor<T>: Singleton with hot reload callbacks.',
  'public async Task<IResult> Checkout([FromServices] IFeatureManager fm, [FromServices] INewEngine engine) {
    if (await fm.IsEnabledAsync("UseNewEngine")) return Results.Ok(await engine.ProcessAsync());
    return Results.Ok("Legacy");
}',
  NULL,
  NULL,
  1,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
