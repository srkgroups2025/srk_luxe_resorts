export function getPermissions(user) {
  console.log('getPermissions user:', user);
  if (!user) {
    return {
      admin: false,
    };
  }

  return {
    admin: user.role === "admin",
  };
}
