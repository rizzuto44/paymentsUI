import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get('prefix')?.toLowerCase() || '';
  const limit = parseInt(searchParams.get('limit') || '10');

  // Validate input
  if (prefix.length < 2) {
    return NextResponse.json({ 
      users: [], 
      error: 'Minimum 2 characters required' 
    }, { status: 400 });
  }

  if (prefix.length > 20) {
    return NextResponse.json({ 
      users: [], 
      error: 'Maximum 20 characters allowed' 
    }, { status: 400 });
  }

  try {
    // Search users with prefix matching
    const { data, error } = await supabase
      .from('users')
      .select('username, owner_address, preferred_dst_eid, chain_key')
      .ilike('username', `${prefix}%`)
      .limit(Math.min(limit, 10)) // Cap at 10 results
      .order('username');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        users: [], 
        error: 'Search failed' 
      }, { status: 500 });
    }

    // Transform data to match expected format
    const users = (data || []).map(user => ({
      username: user.username,
      ownerAddress: user.owner_address as `0x${string}`,
      preferredDstEid: user.preferred_dst_eid,
      chainKey: user.chain_key as 'base' | 'arbitrum'
    }));

    return NextResponse.json({ users }, {
      headers: { 
        'Cache-Control': 'max-age=30', // 30s cache
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      users: [], 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 