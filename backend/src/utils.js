//C EST JUSTE UN INCLUDES DANS UN FILTER POUR VERIFIER SI LE USER A LES PERMISSIONS REQUISES
// si un User
// const user = {
//   name: "ben",
//   permissions: ["ADMIN", "ITEMUPDATE"]
// }
//mais on veut verifier si ils ont ['PERMISSIONUPDATE', 'ADMIN']
//C EST JUSTE UN INCLUDES DANS UN FILTER POUR VERIFIER SI LE USER A LES PERMISSIONS REQUISES

function hasPermission(user, permissionsNeeded) {
  const matchedPermissions = user.permissions.filter(permissionTheyHave =>
    permissionsNeeded.includes(permissionTheyHave)
  );
  if (!matchedPermissions.length) {
    throw new Error(`Vous n'avez pas les permissions requises

      : ${permissionsNeeded}

      Vous avez:

      ${user.permissions}
      `);
  }
}

exports.hasPermission = hasPermission;
