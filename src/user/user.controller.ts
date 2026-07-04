import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { User } from '../auth/schemas/user.schema';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('no-phone')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Lấy danh sách user & ẩn số điện thoại nếu là Admin' })
  @ApiResponse({ status: 200, description: 'Danh sách user (ẩn số điện thoại nếu là Admin)' })
  async findAllWithoutPhone(@Req() req) {
    const adminId = req.user.sub;
    const role = req.user.role;

    const users = await this.userService.findAllByManager(adminId);

    if (role === UserRole.ADMIN) {
      return users.map(({ phone, ...rest }) => rest);
    }

    return users;
  }


  @Get('current')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin user hiện tại theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy user' })
  async getCurrentUser(@Req() req) {
    console.log('Get current user request:', {
      userId: req.user.sub,
      username: req.user.username,
      role: req.user.role
    });
    const user = await this.userService.findOneUser(req.user.sub);
    if (!user) {
      throw new NotFoundException('Không tìm thấy user');
    }
    return user;
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Lấy danh sách user do admin hiện tại quản lý' })
  @ApiResponse({ status: 200, description: 'Danh sách user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Req() req) {
    console.log('Request user:', req.user);
    console.log('User role:', req.user.role);
    const adminId = req.user.sub;
    console.log('Admin ID:', adminId);
    return this.userService.findAllByManager(adminId);
  }

  @Post()
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'user123',
          description: 'Username for the new user'
        },
        password: {
          type: 'string',
          example: 'password123',
          description: 'Password for the new user'
        },
        phone: {
          type: 'string',
          example: '0123456789',
          description: 'Phone number of the user'
        },
        role: {
          type: 'string',
          enum: ['USER', 'ADMIN'],
          example: 'USER',
          description: 'Role of the user. If not provided, defaults to USER'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createUserDto: CreateUserDto, @Req() req) {
    return this.userService.createUser(createUserDto, req.user.sub);
  }

  @Get('managed-by/:adminId')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get users managed by a specific admin' })
  @ApiResponse({ status: 200, description: 'Return list of users managed by the admin', type: [User] })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  async findByManagedBy(@Param('adminId') adminId: string): Promise<User[]> {
    return this.userService.findUsersByManagedBy(adminId);
  }

  @Get('all')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all users (Superadmin only)' })
  @ApiResponse({ status: 200, description: 'Return list of all users', type: [User] })
  @ApiResponse({ status: 403, description: 'Forbidden - Only superadmin can access this endpoint' })
  async getAllUsers(@Req() req): Promise<User[]> {
    return this.userService.getAllUsers(req.user.sub);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Lấy thông tin một user' })
  @ApiParam({ name: 'id', description: 'ID của user' })
  @ApiResponse({ status: 200, description: 'Thông tin user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy user' })
  async findOne(@Param('id') id: string, @Req() req) {
    const adminId = req.user.sub;
    return this.userService.findOneByManager(id, adminId);
  }

  @Post(':id/add-coins')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Cộng xu cho user' })
  @ApiParam({ name: 'id', description: 'ID của user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          example: 1000,
          description: 'Số xu cần cộng'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Cộng xu thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy user' })
  async addCoins(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Req() req
  ) {
    const adminId = req.user.sub;
    return this.userService.addCoins(id, adminId, amount);
  }

  @Post(':id/subtract-coins')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Trừ xu của user' })
  @ApiParam({ name: 'id', description: 'ID của user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          example: 1000,
          description: 'Số xu cần trừ'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Trừ xu thành công' })
  @ApiResponse({ status: 400, description: 'Bad request - Số xu không hợp lệ hoặc không đủ' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy user' })
  async subtractCoins(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Req() req
  ) {
    console.log('Subtract coins request:', {
      userId: id,
      amount: amount,
      adminId: req.user.sub,
      adminRole: req.user.role
    });
    const adminId = req.user.sub;
    return this.userService.subtractCoins(id, adminId, amount);
  }

  @Post('subtract-coins-for-action')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Trừ xu của user hiện tại khi thực hiện hành động' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          example: 1000,
          description: 'Số xu cần trừ'
        },
        action: {
          type: 'string',
          example: 'PLAY_GAME',
          description: 'Hành động gây ra việc trừ xu'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Trừ xu thành công' })
  @ApiResponse({ status: 400, description: 'Bad request - Số xu không hợp lệ hoặc không đủ' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy user' })
  async subtractCoinsForCurrentUser(
    @Body('amount') amount: number,
    @Body('action') action: string,
    @Req() req
  ) {
    console.log('Subtract coins for current user request:', {
      userId: req.user.sub,
      amount: amount,
      action: action,
      username: req.user.username
    });
    return this.userService.subtractCoinsForCurrentUser(req.user.sub, amount, action);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Cập nhật thông tin user' })
  @ApiParam({ name: 'id', description: 'ID của user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'newusername',
          description: 'Tên đăng nhập mới'
        },
        phone: {
          type: 'string',
          example: '0123456789',
          description: 'Số điện thoại mới'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy user' })
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateUserDto,
    @Req() req
  ) {
    const adminId = req.user.sub;
    return this.userService.updateUser(id, adminId, updateData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Xóa user' })
  @ApiParam({ name: 'id', description: 'ID của user' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy user' })
  async remove(@Param('id') id: string, @Req() req) {
    const adminId = req.user.sub;
    return this.userService.deleteUser(id, adminId);
  }
} 