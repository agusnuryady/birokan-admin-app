'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Center, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { getProcedures } from '@/services/procedureService';
import { getUserDetail, updateUserAdmin, UserFormValues } from '@/services/userService';
import { useGlobalLoading } from '@/store/useGlobalLoading';
import { useUserStore } from '@/store/userStore';
import { notifyApiError } from '@/utils/handleApiError';
import { UserForm } from '../_components/UserForm';

export default function Page() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const { showLoading, hideLoading } = useGlobalLoading();
  const { fetchUsers } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserFormValues | null>(null);
  const [procedures, setProcedures] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const userRes = await getUserDetail({ id: params.userId });
        const procRes = await getProcedures({ page: 1, limit: 100, isAssistant: true });

        setUser(userRes);

        if (procRes.data.length > 0) {
          setProcedures(
            procRes.data.map((p: any) => ({
              value: p.id,
              label: p.name,
            }))
          );
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.userId]);

  const handleSubmit = async (values: UserFormValues) => {
    try {
      showLoading();
      const response = await updateUserAdmin(params.userId, values);
      await fetchUsers();
      await notifications.show({
        title: 'Success',
        message: `You have update ${response.email} User successfully 🎉`,
        color: 'green',
      });
      router.back();
    } catch (error: any) {
      notifyApiError(error);
    } finally {
      hideLoading();
    }
  };

  if (loading || !user) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  return <UserForm initialValues={user} procedures={procedures} onSubmit={handleSubmit} />;
}
