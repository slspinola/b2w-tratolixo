import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div
      className="
        w-full max-w-[1400px]
        mx-auto
        px-4 sm:px-6 lg:px-8 py-4 sm:py-6
      "
    >
      {children}
    </div>
  );
}
