import { PrismaClient, Prisma } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// PrismaClient est attaché à l'objet `global` en développement
// pour éviter d'épuiser votre limite de connexions à la base de données.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Options de connexion pour améliorer la stabilité
const prismaClientOptions: Prisma.PrismaClientOptions = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] as Prisma.LogLevel[]
    : ['error'] as Prisma.LogLevel[]
};

let prisma: ReturnType<typeof createPrismaClient>;

function createPrismaClient() {
  return new PrismaClient(prismaClientOptions).$extends(withAccelerate());
}

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  // En développement, utiliser une variable globale pour préserver la valeur
  const globalForPrisma = global as unknown as { prisma?: ReturnType<typeof createPrismaClient> };
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  
  prisma = globalForPrisma.prisma;
}

export { prisma };
export default prisma; 