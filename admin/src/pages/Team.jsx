import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api, fieldErrors } from '../lib/api';
import { useAdmin } from '../context/AdminAuth';
import { Alert, Badge, Button, Card, Field, Input, Modal, PageHeader, PageLoader, PasswordInput, Select, td, th } from '../components/ui';
import { ROLE_LABELS, dateTime } from '../lib/format';

const ROLE_HELP = {
  super_admin: 'Everything, including the admin team and audit log',
  finance: 'Plans and subscriptions',
  support: 'Buyers, sellers and approvals',
  category_manager: 'Buyers, sellers and approvals',
};

function AdminForm({ initial, onClose, onSaved }) {
  const isEdit = Boolean(initial?._id);
  const [f, setF] = useState({ name: initial?.name || '', email: initial?.email || '', role: initial?.role || 'support', password: '', isActive: initial?.isActive ?? true });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const body = isEdit
        ? { name: f.name, role: f.role, isActive: f.isActive, ...(f.password ? { password: f.password } : {}) }
        : { name: f.name, email: f.email, role: f.role, password: f.password };
      await api(isEdit ? `/admin/admins/${initial._id}` : '/admin/admins', { method: isEdit ? 'PATCH' : 'POST', body });
      onSaved(isEdit ? 'Admin updated.' : 'Admin added. Share their login details securely.');
    } catch (e) {
      setErrors(fieldErrors(e));
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={isEdit ? `Edit ${initial.name}` : 'Add admin'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={save}>
            {isEdit ? 'Save' : 'Add admin'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        <Field label="Name" error={errors.name}>
          <Input value={f.name} onChange={set('name')} />
        </Field>
        {!isEdit && (
          <Field label="Email" error={errors.email}>
            <Input type="email" value={f.email} onChange={set('email')} />
          </Field>
        )}
        <Field label="Role" hint={ROLE_HELP[f.role]}>
          <Select value={f.role} onChange={set('role')}>
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={isEdit ? 'New password (leave blank to keep)' : 'Temporary password'} error={errors.password} hint="At least 8 characters">
          <PasswordInput autoComplete="new-password" value={f.password} onChange={set('password')} />
        </Field>
        {isEdit && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-brand-600" checked={f.isActive} onChange={(e) => setF((s) => ({ ...s, isActive: e.target.checked }))} />
            Account active
          </label>
        )}
      </div>
    </Modal>
  );
}

export default function Team() {
  const { admin: me } = useAdmin();
  const [admins, setAdmins] = useState(null);
  const [editing, setEditing] = useState(undefined);
  const [msg, setMsg] = useState(null);

  const load = () =>
    api('/admin/admins')
      .then((d) => setAdmins(d.admins))
      .catch((e) => setMsg({ type: 'error', text: e.message }));

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <PageHeader
        title="Admin team"
        subtitle="Who can sign in to this panel, and what they can do."
        actions={
          <Button onClick={() => setEditing(null)}>
            <Plus className="size-4" /> Add admin
          </Button>
        }
      />
      {msg && <Alert type={msg.type} className="mb-4">{msg.text}</Alert>}
      <Card className="overflow-hidden">
        {!admins ? (
          <PageLoader />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>Name</th>
                  <th className={th}>Role</th>
                  <th className={th}>Status</th>
                  <th className={th}>Last login</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map((a) => (
                  <tr key={a._id}>
                    <td className={td}>
                      <p className="font-medium text-slate-900">
                        {a.name} {a._id === me._id && <span className="text-xs text-slate-400">(you)</span>}
                      </p>
                      <p className="text-xs text-slate-500">{a.email}</p>
                    </td>
                    <td className={td}>
                      <Badge color={a.role === 'super_admin' ? 'blue' : 'gray'}>{ROLE_LABELS[a.role]}</Badge>
                    </td>
                    <td className={td}>
                      <Badge color={a.isActive ? 'green' : 'red'}>{a.isActive ? 'Active' : 'Disabled'}</Badge>
                    </td>
                    <td className={td}>{dateTime(a.lastLoginAt)}</td>
                    <td className={`${td} text-right`}>
                      <Button variant="ghost" className="px-3 py-1.5" onClick={() => setEditing(a)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editing !== undefined && (
        <AdminForm
          initial={editing}
          onClose={() => setEditing(undefined)}
          onSaved={(text) => {
            setEditing(undefined);
            setMsg({ type: 'success', text });
            load();
          }}
        />
      )}
    </>
  );
}
