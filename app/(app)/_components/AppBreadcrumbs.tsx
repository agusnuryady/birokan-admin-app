import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Anchor, Breadcrumbs, Text } from '@mantine/core';

export function AppBreadcrumbs() {
  const pathname = usePathname();

  // Convert pathname into crumbs, e.g. "/directories/123" -> ["directories", "123"]
  const parts = pathname.split('/').filter(Boolean);

  return (
    <Breadcrumbs separator=" / " visibleFrom="md">
      {/* Always show Home as root */}
      <Anchor component={Link} href="/" size="sm" fw={400} c="blue" underline="hover">
        Home
      </Anchor>

      {parts.map((part, i) => {
        const href = `/${parts.slice(0, i + 1).join('/')}`;
        const isLast = i === parts.length - 1;
        const label = part.charAt(0).toUpperCase() + part.slice(1);

        return isLast ? (
          <Text key={i} size="sm" fw={500}>
            {label}
          </Text>
        ) : (
          <Anchor
            key={i}
            component={Link}
            href={href}
            size="sm"
            fw={400}
            c="blue"
            underline="hover"
          >
            {label}
          </Anchor>
        );
      })}
    </Breadcrumbs>
  );
}
