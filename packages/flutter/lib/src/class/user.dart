class User {
  String email;
  String phone;
  String id;
  String type;
  Map permission;

  User({this.email, this.phone, this.id, this.type, this.permission});

  bool hasAccess(String permissionName) {
    if (permission.containsKey(permissionName))
      return permission[permissionName];
    else
      return false;
  }
}
