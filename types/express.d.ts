import { IUser } from "../types/userModel";

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}
