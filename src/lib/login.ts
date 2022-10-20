import { gql } from "@apollo/client/core";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useSignMessage } from "wagmi";

const GET_CHALLENGE = `
query($request: ChallengeRequest!) {
  challenge(request: $request) { text }
}
`;

const AUTHENTICATION = `
mutation($request: SignedAuthChallenge!) { 
  authenticate(request: $request) {
    accessToken
    refreshToken
  }
}
`;

export const useLogin = async (
  address: string
): Promise<{
  accessToken: any;
  refreshToken: any;
  loading?: boolean;
  error?: Error;
}> => {
  const [loadChallenge, { error: errorChallenge, loading: challengeLoading }] =
    useLazyQuery(gql(GET_CHALLENGE), {
      fetchPolicy: "no-cache",
    });
  const [authenticate, { error: errorAuthenticate, loading: authLoading }] =
    useMutation(gql(AUTHENTICATION));
  const {
    signMessageAsync,
    isLoading: signLoading,
    error: errorSign,
  } = useSignMessage();
  if (
    localStorage.getItem("accessToken") &&
    localStorage.getItem("refreshToken")
  ) {
    return {
      accessToken: localStorage.getItem("accessToken"),
      refreshToken: localStorage.getItem("refreshToken"),
    };
  }
  const challengeResponse = await loadChallenge({ variables: { address } });
  const signature = await signMessageAsync(
    challengeResponse.data.challenge.text
  );
  const {
    data: { authenticate: tokens },
  } = await authenticate({ variables: { address, signature } });
  console.log("Acess tokens", tokens.accessTokens);
  const accessToken = tokens.accessToken;
  const refreshToken = tokens.refreshToken;
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  return {
    accessToken,
    refreshToken,
    loading: challengeLoading || signLoading || authLoading,
    error: errorChallenge || errorSign || errorAuthenticate,
  };
};
