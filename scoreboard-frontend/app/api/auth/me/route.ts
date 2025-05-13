import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

interface Credentials {
  firstname: string
  lastname: string
  username: string
  id: number
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
      const credentials: Credentials = JSON.parse(token);

      // Validate required fields
      if (!credentials.firstname || !credentials.lastname || !credentials.username || !credentials.id) {
        return new NextResponse('Invalid token payload', { status: 401 });
      }

      return NextResponse.json(credentials)
    } catch (e) {
      console.error('Failed to parse token:', e)
      return new NextResponse('Invalid token', { status: 401 });
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
