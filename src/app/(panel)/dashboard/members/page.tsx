'use client';
// Penjelasan:
// Kelola Anggota (Admin): daftar, daftarkan (NIK), ubah, hapus.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { api } from '~/lib/axios';
import type { ApiError } from '~/lib/errors/api-error';
import { getErrorMessage } from '~/lib/errors/utils';
import { formatDate } from '~/lib/format';
import type { LibraryUser, PaginatedResponse } from '~/types/library';

import {
  Alert,
  Button,
  Card,
  EmptyRow,
  Field,
  PageHeader,
  TableShell,
} from '../-components/ui';

type MemberForm = {
  id?: string;
  nik: string;
  name: string;
  email: string;
  password: string;
};

const emptyForm: MemberForm = { nik: '', name: '', email: '', password: '' };

export default function Page() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<{
    type: 'error' | 'success';
    msg: string;
  } | null>(null);

  const isEdit = Boolean(form.id);

  const params: Record<string, string | number> = {
    role: 'MEMBER',
    limit: 100,
  };

  if (search) params.search = search;

  const members = useQuery<PaginatedResponse<LibraryUser>>({
    queryKey: [['api', 'users', params]],
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [['api', 'users']] });

  const save = useMutation<unknown, ApiError>({
    mutationFn: async () => {
      if (form.id) {
        // Update: hanya kirim field yang relevan (password opsional)
        const payload: Record<string, string> = {
          name: form.name,
          email: form.email,
        };

        if (form.password) payload.password = form.password;

        return (await api.patch(`/users/${form.id}`, payload)).data;
      }

      return (await api.post('/users', { ...form, role: 'MEMBER' })).data;
    },
    onSuccess: () => {
      setNotice({
        type: 'success',
        msg: form.id ? 'Data anggota diperbarui.' : 'Anggota terdaftar.',
      });
      setForm(emptyForm);
      invalidate();
    },
    onError: (err) => setNotice({ type: 'error', msg: getErrorMessage(err) }),
  });

  const remove = useMutation<unknown, ApiError, string>({
    mutationFn: async (id) => (await api.delete(`/users/${id}`)).data,
    onSuccess: () => {
      setNotice({ type: 'success', msg: 'Anggota dihapus.' });
      invalidate();
    },
    onError: (err) => setNotice({ type: 'error', msg: getErrorMessage(err) }),
  });

  const set = (k: keyof MemberForm) => (v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const nikValid = /^\d{16}$/.test(form.nik);
  const nikError =
    !isEdit && form.nik && !nikValid ? 'NIK harus 16 digit angka' : undefined;

  const canSave =
    form.name &&
    form.email &&
    (isEdit || (nikValid && form.password)) &&
    !save.isPending;

  return (
    <div>
      <PageHeader
        description="Daftarkan & kelola anggota perpustakaan."
        title="Anggota"
      />

      {notice && (
        <div className="mb-4">
          <Alert variant={notice.type}>{notice.msg}</Alert>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Field
            className="max-w-xs"
            placeholder="Cari nama / email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TableShell
            head={
              <tr>
                <th className="px-4 py-3">No. Anggota</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Terdaftar</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            }
          >
            {members.isLoading ? (
              <EmptyRow colSpan={5} text="Memuat..." />
            ) : members.data && members.data.data.length > 0 ? (
              members.data.data.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 font-mono text-xs">
                    {m.memberNumber ?? '-'}
                  </td>
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3">{m.email}</td>
                  <td className="px-4 py-3">{formatDate(m.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        className="px-3 py-1.5"
                        variant="secondary"
                        onClick={() =>
                          setForm({
                            id: m.id,
                            nik: m.nik ?? '',
                            name: m.name,
                            email: m.email,
                            password: '',
                          })
                        }
                      >
                        Ubah
                      </Button>
                      <Button
                        className="px-3 py-1.5"
                        variant="danger"
                        onClick={() => {
                          if (confirm(`Hapus anggota "${m.name}"?`))
                            remove.mutate(m.id);
                        }}
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={5} text="Belum ada anggota." />
            )}
          </TableShell>
        </div>

        <Card className="h-fit space-y-3 p-5">
          <h2 className="font-semibold text-gray-900">
            {isEdit ? 'Ubah Anggota' : 'Daftarkan Anggota'}
          </h2>
          <Field
            disabled={isEdit}
            error={nikError}
            inputMode="numeric"
            label="NIK (16 digit)"
            maxLength={16}
            value={form.nik}
            onChange={(e) => set('nik')(e.target.value.replace(/\D/g, ''))}
          />
          <Field
            label="Nama"
            value={form.name}
            onChange={(e) => set('name')(e.target.value)}
          />
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => set('email')(e.target.value)}
          />
          <Field
            label={
              isEdit ? 'Password (kosongkan jika tidak diubah)' : 'Password'
            }
            type="password"
            value={form.password}
            onChange={(e) => set('password')(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              disabled={!canSave}
              onClick={() => {
                setNotice(null);
                save.mutate();
              }}
            >
              {save.isPending
                ? 'Menyimpan...'
                : isEdit
                  ? 'Simpan Perubahan'
                  : 'Daftarkan'}
            </Button>
            {isEdit && (
              <Button variant="secondary" onClick={() => setForm(emptyForm)}>
                Batal
              </Button>
            )}
          </div>
          {!isEdit && (
            <p className="text-xs text-gray-500">
              Nomor anggota dibuat otomatis oleh sistem.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
