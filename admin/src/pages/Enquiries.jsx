import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Mail, Phone, Search } from 'lucide-react';
import { api } from '../lib/api';
import { Alert, Badge, Button, Card, Empty, Field, Input, Modal, PageHeader, PageLoader, Pagination, Select, Textarea, td, th } from '../components/ui';
import { dateTime } from '../lib/format';

const TOPICS = {
  buying: 'Sourcing',
  selling: 'Supplier',
  partnership: 'Partnership',
  support: 'Account support',
  other: 'Other',
};
const STATUS = {
  new: ['amber', 'New'],
  in_progress: ['blue', 'In progress'],
  closed: ['gray', 'Closed'],
};

function EnquiryDetail({ enquiry, onClose, onSaved }) {
  const [status, setStatus] = useState(enquiry.status);
  const [note, setNote] = useState(enquiry.note || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (nextStatus = status) => {
    setSaving(true);
    setError('');
    try {
      await api(`/admin/enquiries/${enquiry._id}`, { method: 'PATCH', body: { status: nextStatus, note } });
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const replyLink = `mailto:${enquiry.email}?subject=${encodeURIComponent('Re: your enquiry to Ranavista')}&body=${encodeURIComponent(
    `Hi ${enquiry.name.split(' ')[0]},\n\nThank you for contacting Ranavista.\n\n\n\n— \nOn ${new Date(enquiry.createdAt).toLocaleDateString()} you wrote:\n> ${enquiry.message.replace(/\n/g, '\n> ')}`
  )}`;

  return (
    <Modal
      open
      size="lg"
      title={enquiry.name}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button loading={saving} onClick={() => save()}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {error && <Alert type="error">{error}</Alert>}
        <div className="flex flex-wrap gap-2">
          <Badge color="gold">{TOPICS[enquiry.topic]}</Badge>
          <Badge color={STATUS[enquiry.status][0]}>{STATUS[enquiry.status][1]}</Badge>
          <span className="text-xs text-slate-500">Received {dateTime(enquiry.createdAt)}</span>
        </div>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <a href={`mailto:${enquiry.email}`} className="flex items-center gap-2 text-brand-600 hover:underline">
            <Mail className="size-4" /> {enquiry.email}
          </a>
          {enquiry.phone && (
            <a href={`tel:${enquiry.phone}`} className="flex items-center gap-2 text-brand-600 hover:underline">
              <Phone className="size-4" /> {enquiry.phone}
            </a>
          )}
          {enquiry.company && (
            <p className="flex items-center gap-2 text-slate-700">
              <Building2 className="size-4 text-slate-400" /> {enquiry.company}
            </p>
          )}
        </div>
        <div className="whitespace-pre-wrap rounded-lg bg-paper p-4 text-sm leading-relaxed text-slate-700">{enquiry.message}</div>
        <a href={replyLink} className="inline-flex items-center gap-2 rounded-md bg-accent-500 px-4 py-2.5 text-sm font-medium text-brand-950 hover:bg-accent-400" onClick={() => status === 'new' && setStatus('in_progress')}>
          <Mail className="size-4" /> Reply by email
        </a>
        <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="new">New</option>
              <option value="in_progress">In progress</option>
              <option value="closed">Closed</option>
            </Select>
          </Field>
          <Field label="Internal note" hint="Only admins see this.">
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>
      </div>
    </Modal>
  );
}

export default function Enquiries() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);
  const [q, setQ] = useState(params.get('q') || '');

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  const qs = params.toString();
  const load = useCallback(
    () =>
      api(`/admin/enquiries?${qs}`)
        .then((d) => {
          setData(d);
          setError('');
        })
        .catch((e) => setError(e.message)),
    [qs]
  );

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHeader
        title="Enquiries"
        subtitle={data ? `Messages from the website’s Contact Us form · ${data.newCount} new` : 'Messages from the website’s Contact Us form'}
      />

      <form
        className="mb-4 flex flex-wrap gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: q.trim() });
        }}
      >
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-9" placeholder="Search name, email, company, message…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select className="w-auto" value={params.get('status') || ''} onChange={(e) => update({ status: e.target.value })}>
          <option value="">Any status</option>
          <option value="new">New</option>
          <option value="in_progress">In progress</option>
          <option value="closed">Closed</option>
        </Select>
        <Select className="w-auto" value={params.get('topic') || ''} onChange={(e) => update({ topic: e.target.value })}>
          <option value="">All topics</option>
          {Object.entries(TOPICS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </form>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      <Card className="overflow-hidden">
        {!data ? (
          <PageLoader />
        ) : !data.enquiries.length ? (
          <Empty title="No enquiries yet" text="Messages sent from the website’s contact page will appear here." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className={th}>From</th>
                    <th className={th}>Topic</th>
                    <th className={th}>Message</th>
                    <th className={th}>Status</th>
                    <th className={th}>Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.enquiries.map((e) => (
                    <tr key={e._id} className={`cursor-pointer hover:bg-slate-50 ${e.status === 'new' ? 'bg-accent-50/60' : ''}`} onClick={() => setOpen(e)}>
                      <td className={td}>
                        <p className={`text-ink ${e.status === 'new' ? 'font-semibold' : 'font-medium'}`}>{e.name}</p>
                        <p className="text-xs text-slate-500">{e.company || e.email}</p>
                      </td>
                      <td className={td}>{TOPICS[e.topic]}</td>
                      <td className={`${td} max-w-sm`}>
                        <p className="line-clamp-2 text-slate-600">{e.message}</p>
                      </td>
                      <td className={td}>
                        <Badge color={STATUS[e.status][0]}>{STATUS[e.status][1]}</Badge>
                      </td>
                      <td className={`${td} whitespace-nowrap`}>{dateTime(e.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} pages={data.pages} total={data.total} onPage={(p) => update({ page: String(p) })} />
          </>
        )}
      </Card>

      {open && (
        <EnquiryDetail
          enquiry={open}
          onClose={() => setOpen(null)}
          onSaved={() => {
            setOpen(null);
            load();
          }}
        />
      )}
    </>
  );
}
