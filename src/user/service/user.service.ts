import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '../models/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../models/user.interface';
import { Observable, catchError, from, of, switchMap, throwError } from 'rxjs';
import { AuthService } from 'src/auth/service/auth.service';

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
        return from(this.userRepository.update(id, user));
    }
    
    deleteOne(id: number): Observable<any>{
        return from(this.userRepository.delete(id));
    }

    login(user: User): Observable<string>{
        return this.validateUser(user.email, user.password).pipe(
            switchMap((user: User) => {
                if(user){
                    return this.authService.generateJWT(user).pipe(
                        switchMap((jwt: string) => of(jwt))
                    )
                }else{
                    return 'Wrong Credentials';
                }
            })
        )
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
