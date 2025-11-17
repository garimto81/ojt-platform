const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function runMigrations() {
  console.log('━'.repeat(60))
  console.log('🚀 데이터베이스 마이그레이션 실행')
  console.log('━'.repeat(60))

  // DATABASE_URL 읽기
  const envPath = path.join(process.cwd(), '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const databaseUrlMatch = envContent.match(/DATABASE_URL=(.+)/)

  if (!databaseUrlMatch) {
    console.error('❌ DATABASE_URL이 .env.local에 없습니다.')
    process.exit(1)
  }

  const databaseUrl = databaseUrlMatch[1].trim()
  console.log(`\n✅ DATABASE_URL 확인: ${databaseUrl.substring(0, 50)}...`)

  // PostgreSQL 클라이언트 생성
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    // 연결
    console.log('\n🔌 데이터베이스 연결 중...')
    await client.connect()
    console.log('✅ 데이터베이스 연결 성공')

    // 마이그레이션 파일 읽기
    const migrationFile = path.join(
      process.cwd(),
      'supabase',
      'combined_migration.sql'
    )

    if (!fs.existsSync(migrationFile)) {
      console.error(`❌ 마이그레이션 파일을 찾을 수 없습니다: ${migrationFile}`)
      process.exit(1)
    }

    console.log(`\n📄 마이그레이션 파일: supabase/combined_migration.sql`)

    const sql = fs.readFileSync(migrationFile, 'utf-8')
    const lineCount = sql.split('\n').length
    console.log(`📊 총 ${lineCount.toLocaleString()}줄`)

    // 마이그레이션 실행
    console.log('\n⏳ 마이그레이션 실행 중...')
    const startTime = Date.now()

    await client.query(sql)

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`✅ 마이그레이션 완료 (${duration}초)`)

    // 테이블 확인
    console.log('\n━'.repeat(60))
    console.log('📊 생성된 테이블 확인')
    console.log('━'.repeat(60))

    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `)

    console.log(`\n✅ 총 ${result.rows.length}개 테이블 생성됨:\n`)
    result.rows.forEach((row, index) => {
      console.log(`   ${(index + 1).toString().padStart(2)}. ${row.table_name}`)
    })

    console.log('\n━'.repeat(60))
    console.log('🎉 마이그레이션이 성공적으로 완료되었습니다!')
    console.log('━'.repeat(60))
  } catch (error) {
    console.error('\n❌ 마이그레이션 실행 중 오류 발생:')
    console.error(error.message)

    if (error.message.includes('already exists')) {
      console.log(
        '\n⚠️  일부 테이블이 이미 존재합니다. 이는 정상적인 경우일 수 있습니다.'
      )
      console.log('   데이터베이스 상태를 확인하세요.')
    }

    process.exit(1)
  } finally {
    await client.end()
    console.log('\n🔌 데이터베이스 연결 종료\n')
  }
}

// 실행
runMigrations().catch(console.error)
