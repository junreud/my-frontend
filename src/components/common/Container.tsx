// src/components/ui/container.tsx
export function Container({ children }: { children: React.ReactNode }) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 items-center">
        {children}
      </div>
    );
  }
  