import { PermissionGroup } from '../modules/permission-group/permission-group.model'
import { Permission } from '../modules/permission/permission.model'
import { Group } from '../modules/group/group.model'
import { connectDB } from '~/common/config/mongodb.config'
import bcrypt from 'bcrypt'
import { STATUS } from '~/common/constants/status.constants'
import { ACCOUNT_KIND } from '~/modules/account/account.constants'
import { GROUP_KIND, GROUP_NAME } from '~/modules/group/group.constants'
import { Account } from '~/modules/account/account.model'
import { Forecast } from '~/modules/forecast/forecast.model'
import { Question } from '~/modules/question/question.model'
import { Session } from '~/modules/session/session.model'
import { Topic } from '~/modules/topic/topic.model'
import { Voice } from '~/modules/voice/voice.model'
import { File } from '~/modules/file/file.model'

export const seedData = async () => {
  try {
    await connectDB()

    await Promise.all([
      PermissionGroup.deleteMany({}),
      Permission.deleteMany({}),
      Group.deleteMany({}),
      Account.deleteMany({}),
      Forecast.deleteMany({}),
      Question.deleteMany({}),
      Session.deleteMany({}),
      Topic.deleteMany({}),
      Voice.deleteMany({}),
      File.deleteMany({})
    ])

    const permissionGroupPerGroup = await PermissionGroup.create({
      name: 'Quản lý nhóm quyền',
      description: 'Nhóm quyền cho phép quản lý nhóm quyền chứa các quyền'
    })

    const permissionGroupPers = await Permission.insertMany([
      {
        name: 'Thêm mới nhóm quyền',
        pCode: 'PERMISSION_GROUP:CREATE',
        description: 'Create new permission group',
        permissionGroupId: permissionGroupPerGroup._id
      },
      {
        name: 'Cập nhật nhóm quyền',
        pCode: 'PERMISSION_GROUP:UPDATE',
        description: 'Update permission group',
        permissionGroupId: permissionGroupPerGroup._id
      },
      {
        name: 'Xóa nhóm quyền',
        pCode: 'PERMISSION_GROUP:DELETE',
        description: 'Delete permission group',
        permissionGroupId: permissionGroupPerGroup._id
      },
      {
        name: 'Danh sách nhóm quyền',
        pCode: 'PERMISSION_GROUP:VIEW:ALL',
        description: 'List all permission groups',
        permissionGroupId: permissionGroupPerGroup._id
      },
      {
        name: 'Chi tiết nhóm quyền',
        pCode: 'PERMISSION_GROUP:VIEW',
        description: 'Get a specific permission group',
        permissionGroupId: permissionGroupPerGroup._id
      }
    ])

    const permissionPerGroup = await PermissionGroup.create({
      name: 'Quản lý quyền',
      description: 'Nhóm quyền cho phép quản lý quyền'
    })

    const permissionPers = await Permission.insertMany([
      {
        name: 'Thêm mới quyền',
        pCode: 'PERMISSION:CREATE',
        description: 'Create new permission',
        permissionGroupId: permissionPerGroup._id
      },
      {
        name: 'Cập nhật quyền',
        pCode: 'PERMISSION:UPDATE',
        description: 'Update permission',
        permissionGroupId: permissionPerGroup._id
      },
      {
        name: 'Xóa quyền',
        pCode: 'PERMISSION:DELETE',
        description: 'Delete permission',
        permissionGroupId: permissionPerGroup._id
      },
      {
        name: 'Danh sách quyền',
        pCode: 'PERMISSION:VIEW:ALL',
        description: 'List all permissions',
        permissionGroupId: permissionPerGroup._id
      },
      {
        name: 'Chi tiết quyền',
        pCode: 'PERMISSION:VIEW',
        description: 'Get a specific permission',
        permissionGroupId: permissionPerGroup._id
      }
    ])

    const groupPerGroup = await PermissionGroup.create({
      name: 'Quản lý nhóm vai trò',
      description: 'Nhóm quyền cho phép quản lý nhóm vai trò (admin, user,...)'
    })

    const groupPers = await Permission.insertMany([
      {
        name: 'Thêm mới nhóm vai trò',
        pCode: 'GROUP:CREATE',
        description: 'Create new group',
        permissionGroupId: groupPerGroup._id
      },
      {
        name: 'Cập nhật nhóm vai trò',
        pCode: 'GROUP:UPDATE',
        description: 'Update group',
        permissionGroupId: groupPerGroup._id
      },
      {
        name: 'Xóa nhóm vai trò',
        pCode: 'GROUP:DELETE',
        description: 'Delete group',
        permissionGroupId: groupPerGroup._id
      },
      {
        name: 'Danh sách nhóm vai trò',
        pCode: 'GROUP:VIEW:ALL',
        description: 'List all groups',
        permissionGroupId: groupPerGroup._id
      },
      {
        name: 'Chi tiết nhóm vai trò',
        pCode: 'GROUP:VIEW',
        description: 'Get a specific group',
        permissionGroupId: groupPerGroup._id
      }
    ])

    const accountPerGroup = await PermissionGroup.create({
      name: 'Quản lý tài khoản',
      description: 'Nhóm quyền cho phép quản lý tài khoản người dùng'
    })

    const accountPers = await Permission.insertMany([
      {
        name: 'Thêm mới tài khoản',
        pCode: 'ACCOUNT:CREATE',
        description: 'Create new account',
        permissionGroupId: accountPerGroup._id
      },
      {
        name: 'Cập nhật tài khoản',
        pCode: 'ACCOUNT:UPDATE',
        description: 'Update account',
        permissionGroupId: accountPerGroup._id
      },
      {
        name: 'Xóa tài khoản',
        pCode: 'ACCOUNT:DELETE',
        description: 'Delete account',
        permissionGroupId: accountPerGroup._id
      },
      {
        name: 'Danh sách tài khoản',
        pCode: 'ACCOUNT:VIEW:ALL',
        description: 'List all accounts',
        permissionGroupId: accountPerGroup._id
      },
      {
        name: 'Chi tiết tài khoản',
        pCode: 'ACCOUNT:VIEW',
        description: 'Get a specific account',
        permissionGroupId: accountPerGroup._id
      }
    ])

    const voicePerGroup = await PermissionGroup.create({
      name: 'Quản lý giọng đọc',
      description: 'Nhóm quyền cho phép quản lý tài các giọng đọc'
    })

    const voicePers = await Permission.insertMany([
      {
        name: 'Thêm mới giọng đọc',
        pCode: 'VOICE:CREATE',
        description: 'Create new voice',
        permissionGroupId: voicePerGroup._id
      },
      {
        name: 'Cập nhật giọng đọc',
        pCode: 'VOICE:UPDATE',
        description: 'Update voice',
        permissionGroupId: voicePerGroup._id
      },
      {
        name: 'Xóa giọng đọc',
        pCode: 'VOICE:DELETE',
        description: 'Delete voice',
        permissionGroupId: voicePerGroup._id
      },
      {
        name: 'Danh sách giọng đọc',
        pCode: 'VOICE:VIEW:ALL',
        description: 'List all voices',
        permissionGroupId: voicePerGroup._id
      },
      {
        name: 'Chi tiết giọng đọc',
        pCode: 'VOICE:VIEW',
        description: 'Get a specific voice',
        permissionGroupId: voicePerGroup._id
      },
      {
        name: 'Kích hoạt giọng đọc',
        pCode: 'VOICE:ACTIVATE:PENDING',
        description: 'Activate a pending voice',
        permissionGroupId: voicePerGroup._id
      }
    ])

    const topicPerGroup = await PermissionGroup.create({
      name: 'Quản lý chủ đề',
      description: 'Nhóm quyền cho phép quản lý các chủ đề'
    })

    const topicPers = await Permission.insertMany([
      {
        name: 'Thêm mới chủ đề',
        pCode: 'TOPIC:CREATE',
        description: 'Create new topic',
        permissionGroupId: topicPerGroup._id
      },
      {
        name: 'Cập nhật chủ đề',
        pCode: 'TOPIC:UPDATE',
        description: 'Update topic',
        permissionGroupId: topicPerGroup._id
      },
      {
        name: 'Xóa chủ đề',
        pCode: 'TOPIC:DELETE',
        description: 'Delete topic',
        permissionGroupId: topicPerGroup._id
      },
      {
        name: 'Danh sách chủ đề',
        pCode: 'TOPIC:VIEW:ALL',
        description: 'List all topics',
        permissionGroupId: topicPerGroup._id
      },
      {
        name: 'Chi tiết chủ đề',
        pCode: 'TOPIC:VIEW',
        description: 'Get a specific topic',
        permissionGroupId: topicPerGroup._id
      }
    ])

    const questionPerGroup = await PermissionGroup.create({
      name: 'Quản lý câu hỏi',
      description: 'Nhóm quyền cho phép quản lý các câu hỏi'
    })

    const questionPers = await Permission.insertMany([
      {
        name: 'Thêm mới câu hỏi',
        pCode: 'QUESTION:CREATE',
        description: 'Create new question',
        permissionGroupId: questionPerGroup._id
      },
      {
        name: 'Cập nhật câu hỏi',
        pCode: 'QUESTION:UPDATE',
        description: 'Update question',
        permissionGroupId: questionPerGroup._id
      },
      {
        name: 'Xóa câu hỏi',
        pCode: 'QUESTION:DELETE',
        description: 'Delete question',
        permissionGroupId: questionPerGroup._id
      },
      {
        name: 'Danh sách câu hỏi',
        pCode: 'QUESTION:VIEW:ALL',
        description: 'List all questions',
        permissionGroupId: questionPerGroup._id
      },
      {
        name: 'Chi tiết câu hỏi',
        pCode: 'QUESTION:VIEW',
        description: 'Get a specific question',
        permissionGroupId: questionPerGroup._id
      },
      {
        name: 'Kích hoạt câu hỏi',
        pCode: 'QUESTION:ACTIVATE:PENDING',
        description: 'Activate pending question',
        permissionGroupId: questionPerGroup._id
      }
    ])

    const forecastPerGroup = await PermissionGroup.create({
      name: 'Quản lý Forecast',
      description: 'Nhóm quyền cho phép quản lý các Forecast'
    })

    const forecastPers = await Permission.insertMany([
      {
        name: 'Thêm mới Forecast',
        pCode: 'FORECAST:CREATE',
        description: 'Create new forecast',
        permissionGroupId: forecastPerGroup._id
      },
      {
        name: 'Cập nhật Forecast',
        pCode: 'FORECAST:UPDATE',
        description: 'Update forecast',
        permissionGroupId: forecastPerGroup._id
      },
      {
        name: 'Xóa Forecast',
        pCode: 'FORECAST:DELETE',
        description: 'Delete forecast',
        permissionGroupId: forecastPerGroup._id
      },
      {
        name: 'Danh sách Forecast',
        pCode: 'FORECAST:VIEW:ALL',
        description: 'List all forecasts',
        permissionGroupId: forecastPerGroup._id
      },
      {
        name: 'Chi tiết Forecast',
        pCode: 'FORECAST:VIEW',
        description: 'Get a specific forecast',
        permissionGroupId: forecastPerGroup._id
      }
      // {
      //   name: 'Kích hoạt Forecast',
      //   pCode: 'FORECAST:ACTIVATE:PENDING',
      //   description: 'Activate pending forecast',
      //   permissionGroupId: forecastPerGroup._id
      // }
    ])

    const permissionIds = [
      ...permissionGroupPers,
      ...permissionPers,
      ...groupPers,
      ...accountPers,
      ...voicePers,
      ...topicPers,
      ...questionPers,
      ...forecastPers
    ].map((p) => p._id)

    const groups = await Group.insertMany([
      {
        name: GROUP_NAME.ADMIN,
        description: 'Quản trị viên hệ thống',
        kind: GROUP_KIND.ADMIN,
        permissionIds: permissionIds
      },
      {
        name: GROUP_NAME.USER,
        description: 'Người dùng',
        kind: GROUP_KIND.USER,
        permissionIds: []
      }
    ])

    await Account.create({
      username: 'superadmin',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123654', 10),
      fullName: 'Super Admin',
      groupId: groups[0]._id,
      isSuperAdmin: true,
      kind: ACCOUNT_KIND.ADMIN,
      status: STATUS.ACTIVE
    })

    await Account.create({
      username: 'user01',
      email: 'user01@example.com',
      password: await bcrypt.hash('user123654', 10),
      fullName: 'Normal User',
      groupId: groups[1]._id,
      kind: ACCOUNT_KIND.USER,
      status: STATUS.ACTIVE
    })

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Lỗi script seedData:', error)
    process.exit(1)
  }
}

seedData()
