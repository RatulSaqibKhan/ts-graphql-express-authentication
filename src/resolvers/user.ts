import { User } from "../entities/User";
import { DbContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";

@InputType()
class UserRegisterInput {
  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  password: string;
}

@InputType()
class UserLoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("registerInput") registerInput: UserRegisterInput,
    @Ctx() { em }: DbContext
  ): Promise<UserResponse>  {
    if (!registerInput.email || typeof registerInput.email === 'undefined') {
      return {
        errors: [{
          field: "email",
          message: "Email is required!"
        }]
      };
    }
    if (!registerInput.name || typeof registerInput.name === 'undefined') {
      return {
        errors: [{
          field: "email",
          message: "Name is required!"
        }]
      };
    }
    if (registerInput.password.length < 6) {
      return {
        errors: [{
          field: "password",
          message: "Password must be at least of 6 characters!"
        }]
      };
    }
    const hashedPassword = await argon2.hash(registerInput.password);
    const user = em.create(User, {
      email: registerInput.email,
      name: registerInput.name,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      if(err.sqlState == 23000) {
        return {
          errors: [{
            field: "email",
            message: "Email already taken."
          }]
        };
      }
    }
    return { user };
  }
  
  @Mutation(() => UserResponse)
  async login(
    @Arg("loginInput") loginInput: UserLoginInput,
    @Ctx() { em }: DbContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {email: loginInput.email })
    if (!user) {
      return {
        errors: [{
          field: "name",
          message: "User email doesn't exist"
        }]
      };
    }
    const validPass = await argon2.verify(user.password, loginInput.password);
    if (!validPass) {
      return {
        errors: [{
          field: "password",
          message: "Incorrect password!"
        }]
      };
    }

    return { user };
  }

  @Query(() => [User])
  getUsers(@Ctx() { em }: DbContext): Promise<User[]> {
    return em.find(User, {});
  }

  @Query(() => User, { nullable: true })
  getUser(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: DbContext
  ): Promise<User | null> {
    return em.findOne(User, { id });
  }

  @Mutation(() => User)
  async createUser(
    @Arg("email", () => String) email: string,
    @Arg("name", () => String) name: string,
    @Arg("password", () => String) password: string,
    @Ctx() { em }: DbContext
  ): Promise<User> {
    const user = em.create(User, { email, name, password });
    await em.persistAndFlush(user);
    return user;
  }

  @Mutation(() => User)
  async updateUser(
    @Arg("id", () => Int) id: number,
    @Arg("email", () => String) email: string,
    @Arg("name", () => String) name: string,
    @Ctx() { em }: DbContext
  ): Promise<User | null> {
    const user = await em.findOne(User, { id });
    if (!user) {
      return null;
    }
    if (typeof email !== "undefined") {
      user.email = email;
    }
    if (typeof name !== "undefined") {
      user.name = name;
    }
    await em.persistAndFlush(user);
    return user;
  }

  @Mutation(() => Boolean)
  async deleteUser(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: DbContext
  ): Promise<User | boolean> {
    const user = await em.findOne(User, { id });
    if (!user) {
      return false;
    }
    em.nativeDelete(User, { id });
    return true;
  }
}
