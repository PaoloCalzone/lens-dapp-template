import LoginWallet from "@/components/LoginWallet";
import type { FC } from "react";
import { useState } from "react";

const Login: FC = () => {
  const [hasConnected, setHasConnected] = useState(false);
  const [hasProfile, setHasProfile] = useState(true);
  console.group("Has connected", hasConnected);
  return (
    <div className="p-5">
      {hasProfile ? (
        <div className="space-y-5">
          {hasConnected ? (
            <div className="space-y-1">
              <div className="text-xl font-bold">Please sign the message.</div>
              <div className="text-sm text-gray-500">
                Lenstok uses this signature to verify that you&rsquo;re the
                owner of this address.
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-xl font-bold">Connect your wallet.</div>
              <div className="text-sm text-gray-500">
                Connect with one of our available wallet providers or create a
                new one.
              </div>
            </div>
          )}
          <LoginWallet
            setHasConnected={setHasConnected}
            setHasProfile={setHasProfile}
          />
        </div>
      ) : (
        <div>
          <div className="mb-2 space-y-4">
            <div className="text-xl font-bold">
              It looks like you don&rsquo;t have a Lens profile yet 🌿 Why not
              create one and come back to see us?
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
