import { getAppearanceSettings } from "@/lib/content/appearance";
import { SplashScreenClient } from "./SplashScreenClient";

export async function SplashScreen() {
  const appearance = await getAppearanceSettings();

  return <SplashScreenClient settings={appearance} />;
}
