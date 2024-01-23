import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { Observable } from 'rxjs';
import { User } from '../models/user.interface';

@Controller('users')
export class UserController {
    constructor(private userService: UserService) { }
    
    @Post()
    create(@Body() user: User): Observable<User> {
        return this.userService.create(user);
    }


    @Get()
    findAll() : Observable<User[]>{
        return this.userService.findAll();
    }

    @Delete(':id')
    deleteOne(@Param('id') id:string) : Observable<User> {
        return this.userService.deleteOne(+id)
    }

    @Put(':id')
    updateOne(@Param('id') id: string ,@Body() user:User): Observable<User> {
        return this.userService.updateOne(+id, user)
    }
    @Get(':id')
    findOne(@Param() params): Observable<User> {
        return this.userService.findOne(params.id);
    }
    
}