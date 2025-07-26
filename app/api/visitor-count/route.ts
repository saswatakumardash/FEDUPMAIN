import { NextRequest, NextResponse } from 'next/server'

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL!
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!
const VISITOR_COUNT_KEY = 'visitor_count'
const VISITOR_IPS_KEY = 'visitor_ips'
const IP_EXPIRY_HOURS = 24 // Consider same IP as same visitor for 24 hours

async function upstashFetch(command: string, key: string, ...args: (string | number)[]) {
  const body = JSON.stringify([command, key, ...args])
  const res = await fetch(UPSTASH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body,
  })
  return res.json()
}

function getClientIP(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const clientIP = request.headers.get('x-client-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (clientIP) {
    return clientIP
  }
  
  // Fallback to a default if no IP found
  return 'unknown'
}

export async function GET() {
  try {
    const data = await upstashFetch('GET', VISITOR_COUNT_KEY)
    const count = parseInt(data.result || '0', 10)
    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error fetching visitor count:', error)
    return NextResponse.json({ count: 0 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const currentTime = Date.now()
    const ipKey = `${VISITOR_IPS_KEY}:${clientIP}`
    
    // Check if this IP has visited recently
    const lastVisitData = await upstashFetch('GET', ipKey)
    const lastVisitTime = lastVisitData.result ? parseInt(lastVisitData.result, 10) : 0
    
    // If IP hasn't visited in the last 24 hours, count as new visitor
    const timeDiff = currentTime - lastVisitTime
    const shouldCount = timeDiff > (IP_EXPIRY_HOURS * 60 * 60 * 1000)
    
    if (shouldCount) {
      // Increment visitor count
      const countData = await upstashFetch('INCR', VISITOR_COUNT_KEY)
      
      // Store IP with current timestamp, expire after 24 hours
      await upstashFetch('SET', ipKey, currentTime, 'EX', IP_EXPIRY_HOURS * 3600)
      
      const count = parseInt(countData.result || '1', 10)
      return NextResponse.json({ count, newVisitor: true })
    } else {
      // Get current count without incrementing
      const countData = await upstashFetch('GET', VISITOR_COUNT_KEY)
      const count = parseInt(countData.result || '0', 10)
      return NextResponse.json({ count, newVisitor: false })
    }
  } catch (error) {
    console.error('Error handling visitor count:', error)
    // Fallback to just getting current count
    try {
      const data = await upstashFetch('GET', VISITOR_COUNT_KEY)
      const count = parseInt(data.result || '0', 10)
      return NextResponse.json({ count, newVisitor: false })
    } catch (fallbackError) {
      console.error('Error in fallback:', fallbackError)
      return NextResponse.json({ count: 0, newVisitor: false })
    }
  }
}
