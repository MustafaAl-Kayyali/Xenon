// Isolated UI fixture server: no database, credentials, Firebase, or outbound requests.
// Run with node scripts/ui-test-api.cjs; point a separate Vite test instance at port 3101.
const http = require('node:http')
const id = '742a8d92-3e87-49f4-9f4e-67d3eeda2ffc'
let broadcasts = 0
const notifications = Array.from({ length: 23 }, (_, index) => ({
  _id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  title: `UI test notification ${index + 1}`,
  notification_message: 'Isolated test record. This is not stored in the database or sent to any account.',
  is_read: false,
  createdAt: '2026-08-31T09:00:00.000Z',
}))
const packageItem = { _id: id, package_name: 'UI test Petra journey', package_price: 0, package_type: 'cultural', package_status: 'active', package_description: 'Local fixture only.', startDate: '2027-01-01', endDate: '2027-01-02', max_people: 12, available_seats: 12, details: { itinerary: 'Walk through Petra', included_services: '["Transport",null]', meeting_point: 'Visitor centre' } }

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:3101')
  const path = url.pathname.replace('/api/v1', '')
  let body = { status: 'success', data: [] }
  let status = 200
  if (req.method !== 'GET') {
    // Consume, but never persist, test input. The first broadcast deliberately fails.
    for await (const chunk of req) void chunk
    if (path === '/notifications/broadcast' && ++broadcasts > 1) body = { status: 'success', message: 'Fixture accepted' }
    else { status = 503; body = { message: 'Isolated test service failure' } }
  } else if (path === '/notifications' || path === '/notifications/sent') {
    const page = Number(url.searchParams.get('page') || 1)
    body = { status: 'success', data: notifications.slice((page - 1) * 20, page * 20), current_page: page, total_pages: 2, total_notifications: 23, unread_count: 23 }
  } else if (path === '/profile/me') body = { data: { profile: { _id: id, vendor_company_name: 'UI test vendor', vendor_status: 'active', name: 'UI test account', email: 'ui-test@example.invalid', mobileNumber: '0790000000' } } }
  else if (path === '/packages/') body = { data: [packageItem] }
  else if (path.startsWith('/packages/package/')) body = { data: { package: packageItem } }
  else if (path.includes('/get-booking/')) body = { data: { booking: { _id: id, status: 'completed', total_price: 0, guests: 1, package_id: packageItem, user_id: { name: 'UI fixture traveller' } } } }
  else if (path.startsWith('/analytics')) body = { data: {} }
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(body))
}).listen(3101, '127.0.0.1', () => console.log('Isolated UI fixture API: http://127.0.0.1:3101'))
