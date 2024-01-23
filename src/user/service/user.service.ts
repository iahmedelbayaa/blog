import { Injectable } from '@nestjs/common';
import { UserEntity } from '../models/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../models/user.interface';
import { Observable, from } from 'rxjs';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) { }
    
    create(user: User): Observable<User>{
        //we need to convert the Promise returned by userRepository.save() 
        //to an Observable using the from operator from the rxjs library.
        return from(this.userRepository.save(user));  
    }

    findOne(id: number): Observable<User>{
        return from(this.userRepository.findOne({where: { id: id }}));
    }


    findAll(): Observable<User[]>{
        return from(this.userRepository.find());
    }

    deleteOne(id: number): Observable<any>{
        return from(this.userRepository.delete(id));
    }

    updateOne(id: number, user: User): Observable<any>{
        return from(this.userRepository.update(id, user));
    }
    
    
    
}
