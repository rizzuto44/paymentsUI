import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase environment variables not configured' 
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test connection by counting users
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: `Supabase error: ${error.message}` 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Supabase connected successfully. Found ${count} users.`,
      userCount: count 
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
  }
} 