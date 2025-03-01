import { AppSidebar } from "@/components/Dashboard/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import  MyCalendarPage  from "@/components/ui/Calendar"
import { ChartTwoLines } from "@/components/Dashboard/twolinechart"

export default function Page() {
  const lines = [
    {
      dataKey: "desktop" as const,
      label: "데스크톱",
      stroke: "hsl(var(--chart-1))",
    },
    {
      dataKey: "mobile" as const,
      label: "모바일",
      stroke: "hsl(var(--chart-2))",
    },
  ];
  
  
  const chartData = [
    { date: "12.04", desktop: 71, mobile: 80 },
    { date: "12.05", desktop: 71, mobile: 80 },
    { date: "12.06", desktop: 73, mobile: 80 },
    { date: "12.07", desktop: 43, mobile: 80 },
    { date: "12.08", desktop: 43, mobile: 80 },
    { date: "12.09", desktop: 27, mobile: 80 },
    { date: "12.10", desktop: 21, mobile: 80 },
    { date: "12.11", desktop: 15, mobile: 80 },
    { date: "12.12", desktop: 15, mobile: 80 },
    { date: "12.13", desktop: 14, mobile: 80 },
    { date: "12.14", desktop: 14, mobile: 80 },
    { date: "12.15", desktop: 11, mobile: 80 },
    { date: "12.16", desktop: 11, mobile: 80 },
    { date: "12.17", desktop: 11, mobile: 80 },
    { date: "12.18", desktop: 13, mobile: 80 },
    { date: "12.19", desktop: 12, mobile: 80 },
    { date: "12.20", desktop: 12, mobile: 80 },
    { date: "12.21", desktop: 10, mobile: 80 },
    { date: "12.22", desktop: 6, mobile: 80 },
    { date: "12.23", desktop: 7, mobile: 80 },
    { date: "12.24", desktop: 5, mobile: 80 },
    { date: "12.25", desktop: 4, mobile: 80 },
    { date: "12.26", desktop: 3, mobile: 80 },
    { date: "12.27", desktop: 4, mobile: 80 },
    { date: "12.28", desktop: 3, mobile: 80 },
    { date: "12.29", desktop: 4, mobile: 80 },
    { date: "12.30", desktop: 3, mobile: 80 },
    { date: "12.31", desktop: 3, mobile: 1 },
  ];
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">
                    LAKABE
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Home</BreadcrumbPage>
                  </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* 1) 위쪽 그리드 (aspect-video) */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>

          {/* 2) 스크롤 스내핑 영역 */}
          <div className="fle flex-col snap-y snap-mandatory">
            {/* (1) 첫 번째 스크린 */}
            <div className="h-[90vh] mb-4 snap-start rounded-xl bg-muted/50">
              <MyCalendarPage />
            </div>

            {/* (2) 두 번째 스크린 */}
            <div className="h-[90vh] snap-start rounded-xl bg-muted/50">
              <ChartTwoLines 
                title="부평 헬스장"
                description="2021년 1월 ~ 6월 매출"
                data={chartData}
                lines={lines}
              />
            </div>
          </div>
        </div>


        
      </SidebarInset>
    </SidebarProvider>
  )
}
