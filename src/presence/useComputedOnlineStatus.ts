import { Room } from "@livekit/react-native";
import { useEffect, useState } from "react";
import { AppState } from "react-native";

type Params = {
  isLoggedIn: boolean;
  livekitRoom?: Room | null;
};

export function useComputedOnlineStatus({
  isLoggedIn,
  livekitRoom,
}: Params) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setIsOnline(false);
      return;
    }

    const update = () => {
      const appActive = AppState.currentState === "active";
      const inRoom =
        !!livekitRoom &&
        livekitRoom.state === "connected";

      setIsOnline(appActive || inRoom);
    };

    update();

    const sub = AppState.addEventListener("change", update);
    return () => sub.remove();
  }, [isLoggedIn, livekitRoom]);

  return isOnline;
}
