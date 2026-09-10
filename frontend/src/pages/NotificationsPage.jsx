// Libraries
import { useRef, useState } from 'react'

// Components and services
import { VendorInfo, VendorNotice, VendorStatus } from '../components/vendor/VendorUi.jsx'
import useApi from '../hooks/useApi.js'
import { notificationApi } from '../services/api.js'
import { validateBroadcast } from '../utils/formValidation.js'
import { getCollection, getId } from '../utils/vendorData.js'

// Notifications shared by vendor and administrator portals
export default function NotificationsPage({ role = 'vendor' }) {
  const [refresh, setRefresh] = useState(0)
  const [tab, setTab] = useState('inbox')
  const [page, setPage] = useState(1)
  const actionPending = useRef(false)
  const [showComposer, setShowComposer] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'broadcast', message: '', targetAudience: role === 'admin' ? 'all' : 'users_only' })
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  const state = useApi(() => (tab === 'inbox' ? notificationApi.getMine : notificationApi.getSent)({ page, limit: 20 }), [refresh, tab, page])
  const notifications = getCollection(state.data)
  const totalPages = Math.max(1, Number(state.data?.total_pages) || 1)

  function changeTab(nextTab) {
    setTab(nextTab)
    setPage(1)
    setMessage('')
  }

  async function run(action, successMessage) {
    if (actionPending.current) return false
    actionPending.current = true
    setBusy(successMessage)
    setMessage('')
    try {
      await action()
      setMessage(successMessage)
      setRefresh((value) => value + 1)
      return true
    } catch (error) {
      setMessage(error.message)
      return false
    } finally {
      actionPending.current = false
      setBusy('')
    }
  }

  async function sendBroadcast(event) {
    event.preventDefault()
    const validationError = validateBroadcast(form, role)
    if (validationError) {
      setMessage(validationError)
      return
    }
    const sent = await run(() => notificationApi.broadcast({ ...form, title: form.title.trim(), message: form.message.trim() }), 'Broadcast submitted.')
    if (sent) {
      setForm({ title: '', type: 'broadcast', message: '', targetAudience: role === 'admin' ? 'all' : 'users_only' })
      setShowComposer(false)
      setPage(1)
    }
  }

  return (
    <>
      <header className="admin-header">
        {role === 'admin' && <div><h1>Notifications</h1><p>Review account alerts and keep the notification inbox current.</p></div>}
        <div className="row-actions"><button className="admin-primary" disabled={Boolean(busy)} onClick={() => setShowComposer((value) => !value)}>{showComposer ? 'Close composer' : 'Send broadcast'}</button><button className="vendor-button secondary" disabled={Boolean(busy) || state.loading} onClick={() => setRefresh((value) => value + 1)}>Refresh</button>{tab === 'inbox' && <button className="vendor-button secondary" disabled={Boolean(busy) || state.loading || !notifications.length} onClick={() => run(notificationApi.markAllRead, 'All notifications marked as read.')}>Mark all read</button>}</div>
      </header>
      <div className="role-tabs" style={{ maxWidth: 320 }}><button type="button" aria-pressed={tab === 'inbox'} disabled={Boolean(busy)} className={`role-tab ${tab === 'inbox' ? 'active' : ''}`} onClick={() => changeTab('inbox')}>Inbox</button><button type="button" aria-pressed={tab === 'sent'} disabled={Boolean(busy)} className={`role-tab ${tab === 'sent' ? 'active' : ''}`} onClick={() => changeTab('sent')}>Sent</button></div>
      {showComposer && <form className="vendor-card vendor-form" onSubmit={sendBroadcast} noValidate><h2>New broadcast</h2><label>Title<input value={form.title} minLength="3" maxLength="100" onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required /></label><label>Message<textarea rows="5" value={form.message} minLength="5" maxLength="500" onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} required /></label>{role === 'admin' && <label>Audience<select value={form.targetAudience} onChange={(event) => setForm((current) => ({ ...current, targetAudience: event.target.value }))}><option value="all">All accounts</option><option value="users_only">Travellers only</option><option value="vendors_only">Vendors only</option></select></label>}<button className="vendor-button" disabled={busy}>Send notification</button></form>}
      <VendorNotice state={state} empty={!notifications.length} />
      {message && <p className="admin-data-state" role="status">{message}</p>}
      <section className="vendor-stack">
        {notifications.map((item) => {
          const id = getId(item)
          return <article className="vendor-card" key={id}>
            <div className="row-actions" style={{ justifyContent: 'space-between' }}><h2>{item.title || item.notification_type || 'Notification'}</h2><VendorStatus value={item.is_read ? 'Read' : 'Unread'} /></div>
            <p>{item.notification_message || item.message || '-'}</p>
            <VendorInfo label={tab === 'inbox' ? 'Received' : 'Sent'} value={item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'} />
            <div className="row-actions">
              {tab === 'inbox' && !item.is_read && <button className="vendor-button" disabled={busy} onClick={() => run(() => notificationApi.markRead(id), 'Notification marked as read.')}>Mark read</button>}
              {tab === 'inbox' && <button className="vendor-button danger" disabled={busy} onClick={() => run(() => notificationApi.remove(id), 'Notification removed.')}>Remove</button>}
            </div>
          </article>
        })}
      </section>
      <nav className="row-actions" aria-label="Notification pages">
        <button className="vendor-button secondary" disabled={Boolean(busy) || state.loading || page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
        <span>Page {page}{!state.loading && !state.error && ` of ${Math.max(page, totalPages)}`}</span>
        <button className="vendor-button secondary" disabled={Boolean(busy) || state.loading || Boolean(state.error) || page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
      </nav>
    </>
  )
}
