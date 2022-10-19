import { gql } from "@apollo/client/core";
import { apolloClient } from "@/apollo-client";
import { useSignMessage } from "wagmi";

const GET_CHALLENGE = `
query($request: ChallengeRequest!) {
  challenge(request: $request) { text }
}
`;

const generateChallenge = (address: string) => {
  return apolloClient.query({
    query: gql(GET_CHALLENGE),
    variables: {
      request: {
        address,
      },
      fetchPolicy: "no-cache",
    },
  });
};

const AUTHENTICATION = `
mutation($request: SignedAuthChallenge!) { 
  authenticate(request: $request) {
    accessToken
    refreshToken
  }
}
`;

const authenticate = (address: string, signature: string) => {
  return apolloClient.mutate({
    mutation: gql(AUTHENTICATION),
    variables: {
      request: {
        address,
        signature,
      },
    },
  });
};

export const useLogin = async (
  address: string
): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> => {
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
  const challengeResponse = await generateChallenge(address);
  const signature = await signMessageAsync(
    challengeResponse.data.challenge.text
  );
  const {
    data: { authenticate: tokens },
  } = await authenticate(address, signature);
  console.log("Acess tokens", tokens.accessTokens);
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);

  // TODO return tokens, loading, errors
  // In button component, implement login and logout logic
  return tokens;
};
