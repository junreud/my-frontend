// app/admin/page.tsx

import { AppSidebar } from "@/components/dashboard/app-sidebar"
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

export default function Page() {

  
  
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

            </div>
          </div>
        </div>


        
      </SidebarInset>
    </SidebarProvider>
  )
}
