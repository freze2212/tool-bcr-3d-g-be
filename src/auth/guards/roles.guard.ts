import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../schemas/user.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('Required roles:', requiredRoles);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    console.log('User from request:', user);
    
    // SUPERADMIN có toàn quyền
    if (user.role === UserRole.SUPERADMIN) {
      return true;
    }

    // Kiểm tra role của user có trong danh sách required roles không
    const hasRole = requiredRoles.includes(user.role);
    console.log('User has required role:', hasRole);
    return hasRole;
  }
} 