import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User {

  @Field()
  @PrimaryKey()
  id!: number;

  @Field()
  @Property({type: "string", unique: true})
  email!: string;

  @Field()
  @Property({type: "string"})
  name!: string;

  @Property({type: "string"})
  password!: string;

  @Field()
  @Property({type: 'date'})
  createdAt: Date = new Date();

  @Field()
  @Property({type: 'date', onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}