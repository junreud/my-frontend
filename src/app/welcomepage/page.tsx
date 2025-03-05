// app/welcomepage/page.tsx 예시 
import  WelcomePage from '@/components/Dashboard/WelcomePage';
import LogInHeader from '@/components/LogInPage/LogInHeader';


export default function welcomepage() {
  return (
    <div>
      <LogInHeader />
      <WelcomePage />
    </div>
  );
}
