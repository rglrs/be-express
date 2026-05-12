import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
declare const prisma: PrismaClient<{
    adapter: PrismaPg;
}, never, import("../generated/prisma/runtime/client").DefaultArgs>;
export { prisma };
//# sourceMappingURL=prisma.d.ts.map