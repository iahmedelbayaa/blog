import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors , Request, Res } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { User, UserRole } from '../models/user.interface';
import { Role } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import {Pagination} from 'nestjs-typeorm-paginate';
import { FileInterceptor } from '@nestjs/platform-express';
import path, { join } from 'path';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';


export const storage = {
    storage: diskStorage({
        destination: './uploads/profileimages',
        filename: (req, file, cb) => {
            const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
            const extension: string = path.parse(file.originalname).ext;

            cb(null, `${filename}${extension}`)
        }
    })

}

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


    @UseGuards(JwtAuthGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', storage))
    uploadFile(@UploadedFile() file, @Request() req): Observable<Object> {
        const user: User = req.user;

        return this.userService.updateOne(user.id, {profileImage: file.filename}).pipe(
            tap((user: User) => console.log(user)),
            map((user:User) => ({profileImage: user.profileImage}))
        )
    }

    @Get('profile-image/:imagename')
    findProfileImage(@Param('imagename') imagename, @Res() res): Observable<Object> {
        return of(res.sendFile(join(process.cwd(), 'uploads/profileimages/' + imagename)));
    }
    
}
