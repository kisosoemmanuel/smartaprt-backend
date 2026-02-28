import prisma from './src/prismaClient.js';

async function main(){
  const roles=['TENANT','LANDLORD','CARETAKER','ADMIN'];
  for(const name of roles){
    await prisma.role.upsert({where:{name},update:{},create:{name}});
  }
  console.log('roles ensured');
}

main().catch(e=>{console.error(e);process.exit(1);}).finally(()=>prisma.$disconnect());