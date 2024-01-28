import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "./user.interface";
import { BlogEntryEntity } from "src/blog/model/blog-entry.entity";



@Entity()
export class UserEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({unique: true})
    username: string;

    @Column()
    email: string;
    
    @Column()
    password: string;

    @Column({type: 'enum' , enum: UserRole , default: UserRole.USER})
    role: UserRole;

    @Column({nullable: true})
    profileImage: string;


    @BeforeInsert()
    emailToLowerCase(){
        this.email = this.email.toLowerCase();
    }

    @OneToMany(type => BlogEntryEntity, blogEntryEntity => blogEntryEntity.author)
    blogEntries: BlogEntryEntity[];
}