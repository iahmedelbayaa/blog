import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../models/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User, UserRole } from '../models/user.interface';
import { Observable, catchError, from, map, of, switchMap, throwError } from 'rxjs';
import { AuthService } from 'src/auth/service/auth.service';
import {paginate,Pagination,IPaginationOptions} from 'nestjs-typeorm-paginate';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private authService: AuthService
    ) { }
    
    create(user: User): Observable<User> {
    return from(this.authService.hashPassword(user.password)).pipe(
        switchMap((passwordHash: string) => {
            return from(this.userRepository.findOne({ where: { username: user.username } })).pipe(
                switchMap((existingUser: User) => {
                    if (existingUser) {
                        throw new HttpException('Username already exists', HttpStatus.BAD_REQUEST);
                    }
                    const newUser = new UserEntity();
                    newUser.name = user.name;
                    newUser.username = user.username;
                    newUser.password = passwordHash;
                    newUser.email = user.email;
                    newUser.role = UserRole.USER;
                    return from(this.userRepository.save(newUser)).pipe(
                        switchMap((user: User) => {
                            const { password, ...result } = user;
                            return of(result);
                        }),
                        catchError(err => throwError(err))
                    );
                })
            );
        })
    );
}

    findOne(id: number): Observable<User>{
        return from(this.userRepository.findOne({where :{id:id}})).pipe(
            switchMap((user: User) => {
                const { password, ...result } = user;
                return of(result);
            })
        );
    }

    paginate(options: IPaginationOptions): Observable<Pagination<User>>{
        return from(paginate<User>(this.userRepository, options)).pipe(
            switchMap((users: Pagination<User>) => {
                const userList = users.items.map((user) => {
                    const { password, ...result } = user;
                    return result;
                });
                return of({...users, items: userList});
            })
        )

        
    }

    paginateFilterByUsername(options: IPaginationOptions, user: User): Observable<Pagination<User>>{
        return from(this.userRepository.findAndCount({
            skip: Number(options.page) * Number(options.limit) || 0,
            take: Number(options.limit) || 10,
            order: {id: "ASC"},
            select: ['id', 'name', 'username', 'email', 'role'],
            where: [
                { username: Like(`%${user.username}%`)}
            ]
        })).pipe( 
            map(([users, totalUsers]) => {
                const usersPageable: Pagination<User> = {
                    items: users,
                    links: {
                        first: options.route + `?limit=${options.limit}`,
                        previous: options.route + ``,
                        next: options.route + `?limit=${options.limit}&page=${Number(options.page) + 1}`,
                        last: options.route + `?limit=${options.limit}&page=${Math.ceil(totalUsers / Number(options.limit))}`
                    },
                    meta: {
                        currentPage: Number(options.page),
                        itemCount: users.length,
                        itemsPerPage: Number(options.limit),
                        totalItems: totalUsers,
                        totalPages: Math.ceil(totalUsers / Number(options.limit))
                    }
                };              
                return usersPageable;
            })
        )
    }

    findAll(): Observable<User[]>{
        return from(this.userRepository.find()).pipe(
            switchMap((users: User[]) => {
                const userList = users.map((user) => {
                    const { password, ...result } = user;
                    return result;
                });
                return of(userList);
            })
        );
    }

    updateOne(id: number, user: User): Observable<any>{
        delete user.email;
        delete user.password;
        delete user.role;
        return from(this.userRepository.update(id, user)).pipe(
            switchMap(() => this.findOne(id))
        );
    }

    updateRoleUser(id: number, user: User): Observable<any>{
        return from(this.userRepository.update(id, user));
    }
    
    deleteOne(id: number): Observable<any>{
        return from(this.userRepository.delete(id));
    }

    login(user: User): Observable<string> {
    return this.validateUser(user.email, user.password).pipe(
        switchMap((user: User) => {
            if(user){
                return this.authService.generateJWT(user);
            } else {
                throw new UnauthorizedException('Wrong Credentials');
            }
        })
    );
}

    validateUser(email: string, password: string): Observable<User>{
        return this.findByEmail(email).pipe(
            switchMap((user: User) => this.authService.comparePasswords(password, user.password).pipe(
                switchMap((match: boolean) => {
                    if(match){
                        const { password, ...result } = user;
                        return of(result);
                    }else{
                        throw Error;
                    }
                })
            ))
        )
    }

    findByEmail(email: string): Observable<User>{
        return from(this.userRepository.findOne({where: {email:email}})).pipe(
            switchMap((user: User) => {
                const { password, ...result } = user;
                return of(result);
            })
        );
    }

    
}
