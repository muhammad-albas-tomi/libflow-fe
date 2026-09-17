'use client';
// Penjelasan:
// Kelola Admin (Super Admin): daftar, tambah, ubah, hapus akun admin.
// Form pakai react-hook-form + Zod. Mode edit password opsional.

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';

import { api } from '~/lib/axios';
import { ApiError } from '~/lib/errors/api-error';
import { getErrorMessage } from '~/lib/errors/utils';
import { formatDate } from '~/lib/format';
import {
  adminCreateSchema,
  adminUpdateSchema,
  type AdminCreateInput,
} from '~/schemas/library';
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

type FormValues = AdminCreateInput;
const emptyForm: FormValues = { name: '', email: '', password: '' };

export default function Page() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
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
          modeRef.current === 'edit' ? adminUpdateSchema : adminCreateSchema,
        ) as unknown as Resolver<FormValues>
      )(values, ctx, opts),
    defaultValues: emptyForm,
  });

  const isEdit = editingId !== null;

  const admins = useQuery<PaginatedResponse<LibraryUser>>({
    queryKey: [['api', 'users', { role: 'ADMIN', limit: 100 }]],
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
      return (await api.post('/users', { ...values, role: 'ADMIN' })).data;
    },
    onSuccess: () => {
      setNotice({ type: 'success', msg: editingId ? 'Data admin diperbarui.' : 'Admin dibuat.' });
      startCreate();
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
                        onClick={() => {
                          modeRef.current = 'edit';
                          setEditingId(a.id);
                          reset({ name: a.name, email: a.email, password: '' });
                        }}
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
          <form
            className="space-y-3"
            onSubmit={handleSubmit((values) => {
              setNotice(null);
              save.mutate(values);
            })}
          >
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
                {save.isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan'}
              </Button>
              {isEdit && (
                <Button type="button" variant="secondary" onClick={startCreate}>
                  Batal
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
