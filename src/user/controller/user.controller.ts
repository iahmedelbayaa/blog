import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { Observable, catchError, map, throwError } from 'rxjs';
import { User, UserRole } from '../models/user.interface';
import { Role } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import {paginate,Pagination,IPaginationOptions} from 'nestjs-typeorm-paginate';


@Controller('users')
export class UserController {
    constructor(private userService: UserService) { }
    
    @Post()
    create(@Body() user: User): Observable<User> {
        return this.userService.create(user).pipe(
            map((user: User) => user),
            catchError(err => throwError(err))
        )
    }

    @Post('login')
    login(@Body() user: User): Observable<string> {
        return this.userService.login(user).pipe(
            map((jwt: string) => jwt)
        )
    }


    @Role(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get()
    index(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
        @Query('username') username:string,
    ): Observable<Pagination<User>>{
        limit = limit > 100 ? 100 : limit;

        if (username === null || username === undefined) {
            return this.userService.paginate({ page: Number(page), limit: Number(limit), route: 'http://localhost:3000/api/users' });
        } else {
            return this.userService.paginateFilterByUsername(
                { page: Number(page), limit: Number(limit), route: 'http://localhost:3000/api/users' },
                { username }
            )
        }
    }

    @Get(':id')
    findOne(@Param() params): Observable<User> {
        return this.userService.findOne(params.id);
    }

    @Put(':id')
    updateOne(@Param('id') id: string ,@Body() user:User): Observable<User> {
        return this.userService.updateOne(+id, user)
    }
    
    @Role(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Put(':id/role')
    updateRoleUser(@Param('id') id: string, @Body() user: User): Observable<User>{
        return this.userService.updateRoleUser(+id, user);
    }

    @Delete(':id')
    deleteOne(@Param('id') id:string) : Observable<User> {
        return this.userService.deleteOne(+id)
    }
    
}
