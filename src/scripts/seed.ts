import { PermissionGroup } from '../models/permission-group.model'
import { Permission } from '../models/permission.model'
import { Group } from '../models/group.model'
import { connectDB } from '~/config/mongodb.config'
import { Account } from '~/models'
import bcrypt from 'bcrypt'
import { ACCOUNT_KIND, GROUP_KIND, GROUP_NAME, STATUS } from '~/constants/constants'

export const seedData = async () => {
  try {
    await connectDB()

    await Promise.all([
      PermissionGroup.deleteMany({}),
      Permission.deleteMany({}),
      Group.deleteMany({}),
      Account.deleteMany({})
    ])

    const pGroup = await PermissionGroup.create({
      name: 'Quản lý nhóm quyền'
    })

    const permissions = await Permission.insertMany([
      {
        name: 'Thêm mới quyền',
        pCode: 'PER_C',
        description: 'Create new permission',
        permissionGroupId: pGroup._id
      },
      {
        name: 'Xem chi tiết quyền',
        pCode: 'PER_V',
        description: 'View one permission',
        permissionGroupId: pGroup._id
      },
      {
        name: 'Xóa quyền',
        pCode: 'PER_D',
        description: 'Delete permission',
        permissionGroupId: pGroup._id
      },
      {
        name: 'Cập nhật quyền',
        pCode: 'PER_U',
        description: 'Update permission',
        permissionGroupId: pGroup._id
      },
      {
        name: 'Danh sách quyền',
        pCode: 'PER_L',
        description: 'List all permissions',
        permissionGroupId: pGroup._id
      }
    ])

    const permissionIds = permissions.map((p) => p._id)

    const groups = await Group.insertMany([
      {
        name: GROUP_NAME.ADMIN,
        description: 'Quản trị viên hệ thống',
        kind: GROUP_KIND.ADMIN,
        permissions: permissionIds
      },
      {
        name: GROUP_NAME.USER,
        description: 'Người dùng',
        kind: GROUP_KIND.USER,
        permissions: []
      }
    ])

    const hashedPassword = await bcrypt.hash('admin123654', 10)

    const superAdmin = await Account.create({
      username: 'superadmin',
      email: 'admin@stepupspeak.com',
      password: hashedPassword,
      fullName: 'Super Admin',
      group: groups[0],
      isSuperAdmin: true,
      kind: ACCOUNT_KIND.ADMIN,
      status: STATUS.ACTIVE
    })

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Lỗi script seedData:', error)
    process.exit(1)
  }
}

seedData()
