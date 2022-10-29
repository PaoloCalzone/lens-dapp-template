import type { FC } from "react";
import { useAppStore } from "src/store/app";
import LoginWallet from "./LoginWallet";

const LoginButton: FC = () => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  console.log("CURRENT PROFILE IS:", currentProfile);
  return (
    <>
      <div className="rounded-lg font-bold disabled:opacity-50 shadow-sm focus:ring-2 focus:ring-opacity-50 focus:ring-offset-1 outline-none">
        {currentProfile ? <div>{currentProfile.handle}</div> : <LoginWallet />}
      </div>
    </>
  );
};

export default LoginButton;
