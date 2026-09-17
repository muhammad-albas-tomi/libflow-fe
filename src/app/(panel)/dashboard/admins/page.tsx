'use client';
// Penjelasan:
// Kelola Admin (Super Admin): daftar, tambah, ubah, hapus akun admin.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { api } from '~/lib/axios';
import { ApiError } from '~/lib/errors/api-error';
import { getErrorMessage } from '~/lib/errors/utils';
import { formatDate } from '~/lib/format';
import type { LibraryUser, PaginatedResponse } from '~/types/library';

import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyRow,
  Field,
  PageHeader,
  TableShell,
} from '../-components/ui';

type AdminForm = {
  id?: string;
  name: string;
  email: string;
  password: string;
};

const emptyForm: AdminForm = { name: '', email: '', password: '' };

export default function Page() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AdminForm>(emptyForm);
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  const isEdit = Boolean(form.id);

  const admins = useQuery<PaginatedResponse<LibraryUser>>({
    queryKey: [['api', 'users', { role: 'ADMIN', limit: 100 }]],
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [['api', 'users']] });

  const save = useMutation<unknown, ApiError>({
    mutationFn: async () => {
      if (form.id) {
        const payload: Record<string, string> = { name: form.name, email: form.email };
        if (form.password) payload.password = form.password;
        return (await api.patch(`/users/${form.id}`, payload)).data;
      }
      return (await api.post('/users', { ...form, role: 'ADMIN' })).data;
    },
    onSuccess: () => {
      setNotice({ type: 'success', msg: form.id ? 'Data admin diperbarui.' : 'Admin dibuat.' });
      setForm(emptyForm);
      invalidate();
    },
    onError: (err) => setNotice({ type: 'error', msg: getErrorMessage(err) }),
  });

  const remove = useMutation<unknown, ApiError, string>({
    mutationFn: async (id) => (await api.delete(`/users/${id}`)).data,
    onSuccess: () => {
      setNotice({ type: 'success', msg: 'Admin dihapus.' });
      invalidate();
    },
    onError: (err) => setNotice({ type: 'error', msg: getErrorMessage(err) }),
  });

  const set = (k: keyof AdminForm) => (v: string) => setForm((p) => ({ ...p, [k]: v }));
  const canSave =
    form.name && form.email && (isEdit || form.password) && !save.isPending;

  return (
    <div>
      <PageHeader description="Kelola akun petugas/admin perpustakaan." title="Kelola Admin" />

      {notice && (
        <div className="mb-4">
          <Alert variant={notice.type}>{notice.msg}</Alert>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TableShell
            head={
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Dibuat</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            }
          >
            {admins.isLoading ? (
              <EmptyRow colSpan={5} text="Memuat..." />
            ) : admins.data && admins.data.data.length > 0 ? (
              admins.data.data.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-medium">{a.name}</td>
                  <td className="px-4 py-3">{a.email}</td>
                  <td className="px-4 py-3">
                    <Badge>{a.role}</Badge>
                  </td>
                  <td className="px-4 py-3">{formatDate(a.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        className="px-3 py-1.5"
                        variant="secondary"
                        onClick={() =>
                          setForm({ id: a.id, name: a.name, email: a.email, password: '' })
                        }
                      >
                        Ubah
                      </Button>
                      <Button
                        className="px-3 py-1.5"
                        variant="danger"
                        onClick={() => {
                          if (confirm(`Hapus admin "${a.name}"?`)) remove.mutate(a.id);
                        }}
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={5} text="Belum ada admin." />
            )}
          </TableShell>
        </div>

        <Card className="h-fit space-y-3 p-5">
          <h2 className="font-semibold text-gray-900">
            {isEdit ? 'Ubah Admin' : 'Tambah Admin'}
          </h2>
          <Field label="Nama" value={form.name} onChange={(e) => set('name')(e.target.value)} />
          <Field label="Email" type="email" value={form.email} onChange={(e) => set('email')(e.target.value)} />
          <Field
            label={isEdit ? 'Password (kosongkan jika tidak diubah)' : 'Password'}
            type="password"
            value={form.password}
            onChange={(e) => set('password')(e.target.value)}
          />
          <div className="flex gap-2">
            <Button disabled={!canSave} onClick={() => { setNotice(null); save.mutate(); }}>
              {save.isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
            {isEdit && (
              <Button variant="secondary" onClick={() => setForm(emptyForm)}>
                Batal
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
