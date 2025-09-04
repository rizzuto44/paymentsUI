import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MintPanel } from "@/components/MintPanel";
import { SendPanel } from "@/components/SendPanel";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
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
    </div>
  );
}
