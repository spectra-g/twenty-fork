export const isLiveStackAcceptanceEnabled = (
  environment: NodeJS.ProcessEnv,
) => {
  return (
    environment.CI === 'true' ||
    environment.RUN_LIVE_STACK_ACCEPTANCE === 'true'
  );
};
