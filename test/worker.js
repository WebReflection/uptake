let logged = false;

export const logOnce = (port) => {
  if (logged) return;
  logged = true;
  console.log('');
  console.log(`Cluster server is running on port ${port}`);
  console.log(`\x1b[1mhttp://localhost:${port}/\x1b[0m`);
  console.log('');
};
