import User from "../models/user.model.js";
import { deleteOne, findAll, findOne } from "./handleFactory.js";

export const getAllUsers = findAll(User);
export const getUser = findOne(User);
export const deleteUser = deleteOne(User);
