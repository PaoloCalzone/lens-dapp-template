import type { Dispatch, FC } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  AuthenticateDocument,
  GetChallengeDocument,
  GetUserProfilesDocument,
} from "@/types/lens";
import { CHAIN_ID } from "src/constants";
import { useAppPersistStore, useAppStore } from "src/store/app";
import {
  useAccount,
  useNetwork,
  useConnect,
  useSignMessage,
  useSwitchNetwork,
} from "wagmi";
import type { Connector } from "wagmi";
import { XCircleIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import toast from "react-hot-toast";

interface Props {
  setHasConnected: Dispatch<boolean>;
  setHasProfile: Dispatch<boolean>;
}

const LoginWallet: FC<Props> = ({ setHasConnected, setHasProfile }) => {
  const currentProfile = useAppStore((state) => state.currentProfile);
  const setProfiles = useAppStore((state) => state.setProfiles);
  const setCurrentProfile = useAppStore((state) => state.setCurrentProfile);
  const setProfileId = useAppPersistStore((state) => state.setProfileId);

  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { address, connector: activeConnector } = useAccount();
  const { connectors, error, connectAsync } = useConnect();
  const { signMessageAsync, isLoading: signLoading } = useSignMessage();
  const [loadChallenge, { error: errorChallenge, loading: challengeLoading }] =
    useLazyQuery(GetChallengeDocument, {
      fetchPolicy: "no-cache",
    });
  const [authenticate, { error: errorAuthenticate, loading: authLoading }] =
    useMutation(AuthenticateDocument);
  const [getUserProfiles, { error: errorProfiles, loading: profilesLoading }] =
    useLazyQuery(GetUserProfilesDocument);

  const onConnect = async (connector: Connector) => {
    try {
      const account = await connectAsync({ connector });
      if (account) {
        setHasConnected(true);
        console.log("Account", account);
      }
    } catch {}
  };

  const handleLogin = async () => {
    try {
      // Get challenge
      const challenge = await loadChallenge({
        variables: {
          request: { address },
        },
      });

      if (!challenge?.data?.challenge?.text) {
        return toast.error("ERROR_MESSAGE");
      }

      // Get signature
      const signature = await signMessageAsync({
        message: challenge?.data?.challenge?.text,
      });

      // Auth user and set cookies
      const auth = await authenticate({
        variables: { request: { address, signature } },
      });
      localStorage.setItem("accessToken", auth.data?.authenticate.accessToken);
      localStorage.setItem(
        "refreshToken",
        auth.data?.authenticate.refreshToken
      );

      // Get authed profiles
      const { data: profilesData } = await getUserProfiles({
        variables: { address },
      });

      if (profilesData?.profiles?.items?.length === 0) {
        setHasProfile(false);
      } else {
        const profiles: any = profilesData?.profiles?.items;
        const currentProfile = profiles[0];
        setProfiles(profiles);
        setCurrentProfile(currentProfile);
        setProfileId(currentProfile.id);
      }
    } catch {}
  };

  return activeConnector?.id ? (
    <div>
      {chain?.id === CHAIN_ID ? (
        <button onClick={() => handleLogin()}>Login In with Lens</button>
      ) : (
        <button
          onClick={() => {
            if (switchNetwork) {
              switchNetwork(CHAIN_ID);
            } else {
              toast.error("Please change your network wallet!");
            }
          }}
        >
          Switch Network
        </button>
      )}
    </div>
  ) : (
    <div className="inline-block overflow-hidden space-y-3 w-full text-left align-middle transition-all transform">
      {connectors.map((connector) => {
        return (
          <button
            type="button"
            key={connector.id}
            className={clsx(
              {
                "hover:bg-gray-100 dark:hover:bg-gray-700":
                  connector.id !== activeConnector?.id,
              },
              "w-full flex items-center space-x-2.5 justify-center px-4 py-3 overflow-hidden rounded-xl border dark:border-gray-700/80 outline-none"
            )}
            onClick={() => onConnect(connector)}
            /* disabled={
              mounted
                ? !connector.ready || connector.id === activeConnector?.id
                : false
            } */
          >
            <span className="flex justify-between items-center w-full">
              {/*  {mounted
                ? connector.id === "injected"
                  ? "Browser Wallet"
                  : connector.name
                : connector.name}
              {mounted ? !connector.ready && " (unsupported)" : ""} */}
            </span>
            {/* <img
              src={getWalletLogo(connector.name)}
              draggable={false}
              className="w-6 h-6"
              height={24}
              width={24}
              alt={connector.id}
            /> */}
          </button>
        );
      })}
      {error?.message ? (
        <div className="flex items-center space-x-1 text-red-500">
          <XCircleIcon className="w-5 h-5" />
          <div>{error?.message ?? "Failed to connect"}</div>
        </div>
      ) : null}
    </div>
  );
};

export default LoginWallet;
