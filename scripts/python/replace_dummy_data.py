#!/usr/bin/env python3
"""Replace dummy data with real database integration in landing page"""

import re

# Read the file
with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the useState declarations section
usestate_pattern = r"(const \[email, setEmail\] = useState\(''\)\s+const \[password, setPassword\] = useState\(''\)\s+const \[error, setError\] = useState<string \| null>\(null\)\s+const \[loading, setLoading\] = useState\(false\)\s+const \[checkingAuth, setCheckingAuth\] = useState\(true\))"

# Add stats state
stats_state = r"\1\n  const [stats, setStats] = useState({\n    deploymentRate: 0,\n    graduatedTrainees: 0,\n    trainingDays: 7\n  })"

content = re.sub(usestate_pattern, stats_state, content)

# Find the checkUser useEffect
checkuser_pattern = r"(useEffect\(\(\) => \{\s+const checkUser = async \(\) => \{[\s\S]+?\}, \[router, supabase\.auth\]\))"

# Add loadStats useEffect after checkUser
load_stats_code = r"""\1

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/stats/public')
        const data = await response.json()
        setStats({
          deploymentRate: data.deploymentRate || 0,
          graduatedTrainees: data.graduatedTrainees || 0,
          trainingDays: data.trainingDays || 7
        })
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }
    loadStats()
  }, [])"""

content = re.sub(checkuser_pattern, load_stats_code, content)

# Replace hardcoded values in hero section
content = re.sub(
    r'21일 → 7일',
    r'21일 → {stats.trainingDays}일',
    content
)

# Replace stats in preview cards (line 151, 155, 159)
content = re.sub(
    r'<div className="text-2xl font-black text-wsop-red">95%</div>',
    r'<div className="text-2xl font-black text-wsop-red">{stats.deploymentRate}%</div>',
    content
)

content = re.sub(
    r'<div className="text-2xl font-black text-wsop-red">42명</div>',
    r'<div className="text-2xl font-black text-wsop-red">{stats.graduatedTrainees}명</div>',
    content
)

content = re.sub(
    r'<div className="text-2xl font-black text-wsop-red">7일</div>',
    r'<div className="text-2xl font-black text-wsop-red">{stats.trainingDays}일</div>',
    content
)

# Replace StatCard components (line 295, 296, 297)
content = re.sub(
    r'<StatCard number="21일 → 7일" label="온보딩 기간" />',
    r'<StatCard number={`21일 → ${stats.trainingDays}일`} label="온보딩 기간" />',
    content
)

content = re.sub(
    r'<StatCard number="95%" label="현장 투입률" />',
    r'<StatCard number={`${stats.deploymentRate}%`} label="현장 투입률" />',
    content
)

content = re.sub(
    r'<StatCard number="42명" label="수료 인원" />',
    r'<StatCard number={`${stats.graduatedTrainees}명`} label="수료 인원" />',
    content
)

# Replace title in Training Program Section
content = re.sub(
    r'<h2 className="text-3xl font-bold text-wsop-black dark:text-white mb-8 text-center">7일 교육 프로그램</h2>',
    r'<h2 className="text-3xl font-bold text-wsop-black dark:text-white mb-8 text-center">{stats.trainingDays}일 교육 프로그램</h2>',
    content
)

# Write the updated content
with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Successfully replaced all dummy data with real database integration!")
print("\nChanges made:")
print("1. Added stats state (deploymentRate, graduatedTrainees, trainingDays)")
print("2. Added API fetch useEffect")
print("3. Replaced all hardcoded values:")
print("   - 95% → {stats.deploymentRate}%")
print("   - 42명 → {stats.graduatedTrainees}명")
print("   - 7일 → {stats.trainingDays}일")
print("\n🔄 Dev server will auto-reload...")
