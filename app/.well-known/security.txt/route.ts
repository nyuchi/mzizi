import { NextResponse } from "next/server"

/**
 * GET /.well-known/security.txt
 *
 * RFC 9116 security contact disclosure.
 * https://securitytxt.org/
 */
export async function GET() {
  // Expires: 1 year from build time — update on each release
  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 1)

  const body = `Contact: mailto:security@nyuchi.com
Contact: https://github.com/nyuchi/design-portal/security/advisories/new
Expires: ${expires.toISOString()}
Acknowledgments: https://mzizi.dev/security/acknowledgments
Canonical: https://mzizi.dev/.well-known/security.txt
Policy: https://mzizi.dev/security
Preferred-Languages: en
`

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  })
}
