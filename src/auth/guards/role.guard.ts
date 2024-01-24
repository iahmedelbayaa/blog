import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { User } from 'src/user/models/user.interface';
import { UserService } from 'src/user/service/user.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService
  ) { }
  matchRoles(roles: string[], userRole: string) {
    return roles.some((role) => role == userRole)
  }
  canActivate(context: ExecutionContext): boolean | Observable<boolean> | Promise<boolean>{
    const roles = this.reflector.get<string[]>('roles', context.getHandler)
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user.user;
    return this.userService.findOne(user.id).pipe(
      map((user: User) => {
        const hasRole = () => roles.indexOf(user.role) > -1;
        let hasPermission: boolean = false;
        if (hasRole()) {
          hasPermission = true;
        };
        return user && hasPermission;
      })
    );

  }
}