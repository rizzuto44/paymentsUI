'use client';

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MintPanel } from "@/components/MintPanel";
import { SendPanel } from "@/components/SendPanel";
import { ClientOnly } from "@/components/ClientOnly";

// Force dynamic rendering to prevent SSR issues with Dynamic Labs
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <ClientOnly fallback={
        <Card className="w-[420px] h-[520px] shadow-lg">
          <CardHeader className="pb-4">
            <div className="grid w-full grid-cols-3 bg-muted/20 rounded-md p-1">
              <div className="flex items-center justify-center h-9 px-3 text-sm font-medium">Mint</div>
              <div className="flex items-center justify-center h-9 px-3 text-sm font-medium text-muted-foreground">Send</div>
              <div className="flex items-center justify-center h-9 px-3 text-sm font-medium text-muted-foreground">History</div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Loading...
            </div>
          </CardContent>
        </Card>
      }>
        <Card className="w-[420px] h-[520px] shadow-lg">
          <Tabs defaultValue="mint" className="w-full h-full flex flex-col">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-3 bg-muted/20">
                <TabsTrigger value="mint">Mint</TabsTrigger>
                <TabsTrigger value="send">Send</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-hidden">
              <TabsContent value="mint" className="mt-0 h-full">
                <MintPanel />
              </TabsContent>

              <TabsContent value="send" className="mt-0 h-full">
                <SendPanel />
              </TabsContent>
              
              <TabsContent value="history" className="mt-0 h-full">
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  History Panel - Coming Soon
                </div>
              </TabsContent>
            </CardContent>
            
            <CardFooter className="pt-4">
              {/* Dynamic CTA button area controlled by active tab */}
            </CardFooter>
          </Tabs>
        </Card>
      </ClientOnly>
    </div>
  );
}
