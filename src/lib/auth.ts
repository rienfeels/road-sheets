import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
export const getSession = () => getServerSession(authOptions);
