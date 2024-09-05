import type { UserGQL, UserSessionGQL } from "~/utils/graphql";

const useAuth = defineStore("auth", () => {
  const { onLogin, onLogout, getToken } = useApollo();
  const router = useRouter();

  const { mutate: mutateLogin } = useMutation<{
    auth: UserSessionGQL;
  }>(mutateAuthDiscord);

  // State
  const user = ref<UserGQL>();
  const token = ref<string>();

  // Getters
  const isLoggedIn = computed(() => !!user.value);

  // Actions
  async function login(code: string, state: string) {
    console.log("Logging in with code", code, state);

    const results = await mutateLogin({ code, state });

    console.log(results);

    if (results?.data) {
      user.value = results.data.auth.user;
      token.value = results.data.auth.token;
      onLogin(results.data.auth.token);

      return results.data.auth.user;
    }

    if (results?.errors) {
      throw new GraphQLSimpleError(results.errors);
    }

    throw new Error("An unknown error occurred");
  }

  async function getUser() {
    const tokenFetch = await getToken();

    console.log("Getting user with token", tokenFetch);

    if (!tokenFetch) {
      return;
    }

    token.value = tokenFetch;

    const { data, error } = await useAsyncQuery<{
      current: UserSessionGQL;
    }>(queryCurrentUser);

    if (data.value) {
      user.value = data.value.current.user;
      token.value = data.value.current.token;

      onLogin(data.value.current.token);

      return data.value.current.user;
    }

    if (error.value) {
      user.value = undefined;
      token.value = undefined;
      onLogout();

      throw new GraphQLSimpleError(error.value.message);
    }
  }

  async function logout() {
    // Do something
    onLogout();
    router.replace("/");
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    getUser,
    logout,
  };
});

export default useAuth;
