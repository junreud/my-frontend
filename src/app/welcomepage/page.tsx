// app/welcome/page.tsx (서버 컴포넌트)
import WelcomePageClient from '@/components/ui/WelcomePageClient';

export default function WelcomeParent() {
  // 여기서는 서버 로직, 예: fetch some data on server side

  return (
    <div>
      
      <WelcomePageClient />
    </div>
  );
}
