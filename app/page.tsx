import FootwearBrowser from "@/components/FootwearBrowser";
import { getAllFootwear } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await getAllFootwear();
  return <FootwearBrowser items={items} />;
}
