let x = 0;

export const guid = () => {
  if (x === 50000) x = 0;
  return x++;
};

export const createQueryData = (body, action, frontEndId, token) => ({
  action,
  body,
  frontEndId,
  ...(token ? { token } : {}),
});
