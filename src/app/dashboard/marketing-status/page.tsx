import { MarketingStatusClient } from "./client-components";

export default function Page() {
  // 서버에서 초기 데이터를 넘기지 않고, 클라이언트에서 직접 API를 통해 데이터를 가져옴
  return <MarketingStatusClient />;
}