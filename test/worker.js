let logged = false;

export const logOnce = (port) => {
  if (logged) return;
  logged = true;
  console.log(`Cluster server is running on port ${port}`);
  console.log(`http://localhost:${port}/`);
};
