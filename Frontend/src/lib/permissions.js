export function getPermissions(user) {
  if (!user) {
    return {
      admin: false,
    };
  }

  return {
    admin: user.role === "admin",
  };
}
