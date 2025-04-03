### System Access Types

The permission system works by matching the user's assigned permission types (stored in their permission group) against the required permissions defined on collections and functions. This allows for flexible and granular access control.

For example, a collection could be configured to:

- Allow read access for users with 'user_access' permission
- Restrict write operations to users with 'advanced_settings' permission
- Only let users who has the 'upload_file_access' access type in their permission group to upload new files

**Built-in Permission Types**

The system comes with the following pre-defined permission types:

| Permission Type      | Description                                                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `god_access`         | Grants unrestricted super admin access. Users with this permission can perform any operation and access all collections and functions. |
| `user_access`        | Basic user-level access for authenticated users. Typically grants read access to most collections and basic functionality.             |
| `upload_file_access` | Required specifically for file upload operations. Users need this permission to upload files to the system.                            |
| `remove_file_access` | Required for file deletion operations. Users need this permission to remove files from the system.                                     |
| `anonymous_access`   | Used for unauthenticated access. Defines what operations are available to users who are not logged in.                                 |
| `advanced_settings`  | Grants access to advanced system configuration and administrative features. More privileged than basic user access.                    |

These permission types can be combined in permission groups to create different access levels. For example, an admin user might have both `advanced_settings` and `user_access`, while a basic user would only have `user_access`.

You can also define custom permission types for specific needs in your application. The permission system is flexible enough to accommodate any additional access types you require.
