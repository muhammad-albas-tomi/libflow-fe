'use client';
// Penjelasan:
// Kelola Anggota (Admin): daftar, daftarkan (NIK), ubah, hapus.
// Form pakai react-hook-form + Zod. Mode create butuh NIK+password, edit password opsional.

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';

import { api } from '~/lib/axios';
import { ApiError } from '~/lib/errors/api-error';
import { getErrorMessage } from '~/lib/errors/utils';
import { formatDate } from '~/lib/format';
import {
  memberCreateSchema,
  memberUpdateSchema,
  type MemberCreateInput,
} from '~/schemas/library';
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

type FormValues = MemberCreateInput;
const emptyForm: FormValues = { nik: '', name: '', email: '', password: '' };

export default function Page() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);
  const modeRef = useRef<'create' | 'edit'>('create');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: (values, ctx, opts) =>
      (
        zodResolver(
          modeRef.current === 'edit' ? memberUpdateSchema : memberCreateSchema,
        ) as unknown as Resolver<FormValues>
      )(values, ctx, opts),
    defaultValues: emptyForm,
  });

  const isEdit = editingId !== null;

  const params: Record<string, string | number> = { role: 'MEMBER', limit: 100 };
  if (search) params.search = search;

  const members = useQuery<PaginatedResponse<LibraryUser>>({
    queryKey: [['api', 'users', params]],
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [['api', 'users']] });

  const startCreate = () => {
    modeRef.current = 'create';
    setEditingId(null);
    reset(emptyForm);
  };

  const save = useMutation<unknown, ApiError, FormValues>({
    mutationFn: async (values) => {
      if (editingId) {
        const payload: Record<string, string> = { name: values.name, email: values.email };
        if (values.password) payload.password = values.password;
        return (await api.patch(`/users/${editingId}`, payload)).data;
      }
      return (await api.post('/users', { ...values, role: 'MEMBER' })).data;
    },
    onSuccess: () => {
      setNotice({ type: 'success', msg: editingId ? 'Data anggota diperbarui.' : 'Anggota terdaftar.' });
      startCreate();
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

  return (
    <div>
      <PageHeader description="Daftarkan & kelola anggota perpustakaan." title="Anggota" />

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
                  <td className="px-4 py-3 font-mono text-xs">{m.memberNumber ?? '-'}</td>
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3">{m.email}</td>
                  <td className="px-4 py-3">{formatDate(m.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        className="px-3 py-1.5"
                        variant="secondary"
                        onClick={() => {
                          modeRef.current = 'edit';
                          setEditingId(m.id);
                          reset({ nik: m.nik ?? '', name: m.name, email: m.email, password: '' });
                        }}
                      >
                        Ubah
                      </Button>
                      <Button
                        className="px-3 py-1.5"
                        variant="danger"
                        onClick={() => {
                          if (confirm(`Hapus anggota "${m.name}"?`)) remove.mutate(m.id);
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
          <form
            className="space-y-3"
            onSubmit={handleSubmit((values) => {
              setNotice(null);
              save.mutate(values);
            })}
          >
            <Field
              disabled={isEdit}
              error={errors.nik?.message}
              inputMode="numeric"
              label="NIK (16 digit)"
              maxLength={16}
              {...register('nik')}
            />
            <Field error={errors.name?.message} label="Nama" {...register('name')} />
            <Field error={errors.email?.message} label="Email" type="email" {...register('email')} />
            <Field
              error={errors.password?.message}
              label={isEdit ? 'Password (kosongkan jika tidak diubah)' : 'Password'}
              type="password"
              {...register('password')}
            />
            <div className="flex gap-2">
              <Button disabled={save.isPending} type="submit">
                {save.isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Daftarkan'}
              </Button>
              {isEdit && (
                <Button type="button" variant="secondary" onClick={startCreate}>
                  Batal
                </Button>
              )}
            </div>
          </form>
          {!isEdit && (
            <p className="text-xs text-gray-500">Nomor anggota dibuat otomatis oleh sistem.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
