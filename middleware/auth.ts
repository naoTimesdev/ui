const publicRoutes: string[] = ["/", "/callback/discord"];

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();
  const redirect = encodeURIComponent(to.fullPath);

  try {
    console.log("Running auth middleware", to.path);

    if (!publicRoutes.includes(to.path)) {
      return navigateTo(`/?redirect=${redirect}`);
    }

    const res = await auth.getUser();

    if (!res) {
      return navigateTo(`/?redirect=${redirect}`);
    }
  } catch (e) {
    console.error(e);

    return navigateTo(`/?redirect=${redirect}`);
  }
});
